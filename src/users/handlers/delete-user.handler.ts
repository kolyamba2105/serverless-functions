import { APIGatewayEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { connectToMongo } from 'mongo-connect'
import { UserModel } from 'users/model'
import { UserRepository } from 'users/repository'
import { createResponse, CustomError, StatusCodes, validateId } from 'utils'

export const handle: APIGatewayProxyHandler = ({ pathParameters: { id } }: APIGatewayEvent) => {
  const toResponse = (result: O.Option<UserModel>) => pipe(
    result,
    O.fold(
      () => createResponse<CustomError>(StatusCodes.NotFound)({ message: 'User not found!' }),
      createResponse<null>(StatusCodes.NoContent),
    ),
  )

  return pipe(
    TE.chain<CustomError, unknown, string>(validateId(id))(connectToMongo),
    TE.map<string, T.Task<O.Option<UserModel>>>(UserRepository.findByIdAndDelete),
    TE.chain<CustomError, T.Task<O.Option<UserModel>>, O.Option<UserModel>>(TE.rightTask),
    TE.map<O.Option<UserModel>, APIGatewayProxyResult>(toResponse),
    TE.mapLeft<CustomError, APIGatewayProxyResult>(createResponse(StatusCodes.BadRequest)),
    TE.fold(T.of, T.of)
  )()
}
