import { APIGatewayEvent, APIGatewayProxyHandler } from 'aws-lambda'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { UserRepository } from 'users/repository'
import { User, validateUser } from 'users/validation'
import { createResponse, CustomError, InsertionResult, StatusCodes, toError } from 'utils'

export const handle: APIGatewayProxyHandler = ({ body }: APIGatewayEvent) => {
  const validateBody = (body: string | null): TE.TaskEither<CustomError, User> => pipe(
    body,
    E.fromNullable<CustomError>({ message: 'Body is not provided!' }),
    E.map<NonNullable<string>, E.Either<CustomError, unknown>>((body: NonNullable<string>) => E.parseJSON<CustomError>(body, toError)),
    E.chain<CustomError, E.Either<CustomError, unknown>, E.Either<CustomError, User>>(E.map(validateUser)),
    E.flatten,
    TE.fromEither,
  )

  const toResponse = (result: E.Either<CustomError, InsertionResult>) => pipe(
    result,
    E.fold(
      ({ message }: Error) => createResponse(StatusCodes.BadRequest)({ message }),
      createResponse<InsertionResult>(StatusCodes.Created),
    )
  )

  return pipe(
    TE.chain(UserRepository.create)(validateBody(body)),
    TE.map(toResponse),
    TE.mapLeft(createResponse(StatusCodes.BadRequest)),
    TE.fold(T.of, T.of),
  )()
}
