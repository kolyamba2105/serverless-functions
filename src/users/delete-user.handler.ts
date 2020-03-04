import { APIGatewayEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { connectToMongo } from 'mongo-connect'
import { UserObject, userObjectToUser } from 'users/user'
import { findByIdAndDelete } from 'users/user.repository'
import { createResponse, CustomError, isObjectIdValid, StatusCodes } from 'utils'

export const handle: APIGatewayProxyHandler = ({ pathParameters: { id } }: APIGatewayEvent) => {
  const validateId = (): TE.TaskEither<CustomError, string> => TE.fromEither(isObjectIdValid(id))

  const toResponse = (result: O.Option<UserObject>) => pipe(
    result,
    O.map(userObjectToUser),
    O.fold(
      () => createResponse<CustomError>(StatusCodes.NotFound)({ message: 'User not found!' }),
      createResponse<null>(StatusCodes.NoContent),
    ),
  )

  return pipe(
    TE.chain<CustomError, unknown, string>(validateId)(connectToMongo),
    TE.map<string, T.Task<O.Option<UserObject>>>(findByIdAndDelete),
    TE.chain<CustomError, T.Task<O.Option<UserObject>>, O.Option<UserObject>>(TE.rightTask),
    TE.map<O.Option<UserObject>, APIGatewayProxyResult>(toResponse),
    TE.mapLeft<CustomError, APIGatewayProxyResult>(createResponse(StatusCodes.BadRequest)),
    TE.fold(T.of, T.of)
  )()
}
