import { APIGatewayEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { sequenceT } from 'fp-ts/lib/Apply'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { UserModel } from 'users/model'
import { UserRepository } from 'users/repository'
import { ExactUserPayload, validateUserPayload } from 'users/validation'
import { createResponse, CustomError, StatusCodes, validateBody, validateId } from 'utils'

export const handle: APIGatewayProxyHandler = ({ pathParameters: { id }, body }: APIGatewayEvent) => {
  const toResponse = (result: O.Option<UserModel>): APIGatewayProxyResult =>
    pipe(
      result,
      O.fold(
        () => createResponse(StatusCodes.NotFound)({ message: 'User not found!' }),
        createResponse<null>(StatusCodes.NoContent),
      )
    )

  return pipe(
    sequenceT(TE.taskEither)(validateId(id)(), validateBody<ExactUserPayload>(validateUserPayload)(body)),
    TE.chain(UserRepository.update),
    TE.map(toResponse),
    TE.mapLeft(createResponse<CustomError>(StatusCodes.BadRequest)),
    TE.fold(T.of, T.of),
  )()
}
