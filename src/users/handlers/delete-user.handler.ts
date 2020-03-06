import { APIGatewayEvent, APIGatewayProxyHandler } from 'aws-lambda'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
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
    TE.chain(UserRepository.findByIdAndDelete)(validateId(id)()),
    TE.map(toResponse),
    TE.mapLeft(createResponse<CustomError>(StatusCodes.BadRequest)),
    TE.fold(T.of, T.of)
  )()
}
