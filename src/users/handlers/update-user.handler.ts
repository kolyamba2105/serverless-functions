import { APIGatewayEvent, APIGatewayProxyHandler } from 'aws-lambda'
import { sequenceT } from 'fp-ts/lib/Apply'
import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { UserModel } from 'users/model'
import { UserRepository } from 'users/repository'
import { ExactUserPayload, validateUserPayload } from 'users/validation'
import { createResponse, CustomError, StatusCodes, toError, validateId } from 'utils'

export const handle: APIGatewayProxyHandler = ({ pathParameters: { id }, body }: APIGatewayEvent) => {
  const validateBody = (body: string | null): TE.TaskEither<CustomError, ExactUserPayload> => pipe(
    body,
    E.fromNullable<CustomError>({ message: 'Body is not provided!' }),
    E.chain((body: NonNullable<string>) => E.parseJSON<CustomError>(body, toError)),
    E.chain(validateUserPayload),
    TE.fromEither,
  )

  const toResponse = (result: O.Option<UserModel>) => pipe(
    result,
    O.fold(
      () => createResponse(StatusCodes.NotFound)({ message: 'User not found!' }),
      createResponse<null>(StatusCodes.NoContent),
    )
  )

  return pipe(
    sequenceT(TE.taskEither)(validateId(id)(), validateBody(body)),
    TE.chain(UserRepository.update),
    TE.map(toResponse),
    TE.mapLeft(createResponse<CustomError>(StatusCodes.BadRequest)),
    TE.fold(T.of, T.of),
  )()
}
