import { APIGatewayEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { UserModel, userModelToUserObject, UserObject } from 'users/model'
import { UserRepository } from 'users/repository'
import { createResponse, CustomError, StatusCodes, validateId } from 'utils'

export const handle: APIGatewayProxyHandler = ({ pathParameters: { id } }: APIGatewayEvent) => {
  const toResponse = (result: O.Option<UserModel>): APIGatewayProxyResult =>
    pipe(
      result,
      O.map(userModelToUserObject),
      O.fold(
        () => createResponse<CustomError>(StatusCodes.NotFound)({ message: 'User not found!' }),
        createResponse<UserObject>(StatusCodes.OK),
      ),
    )

  return pipe(
    validateId(id),
    TE.chain(UserRepository.findById),
    TE.map(toResponse),
    TE.mapLeft(createResponse(StatusCodes.BadRequest)),
    TE.fold(T.of, T.of),
  )()
}
