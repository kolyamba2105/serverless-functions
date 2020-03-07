import { APIGatewayEvent, APIGatewayProxyHandler } from 'aws-lambda'
import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { UserRepository } from 'users/repository'
import { User, validateUser } from 'users/validation'
import { createResponse, CustomError, InsertionResult, StatusCodes, validateBody } from 'utils'

export const handle: APIGatewayProxyHandler = ({ body }: APIGatewayEvent) =>
  pipe(
    validateBody<User>(validateUser)(body),
    TE.chain(UserRepository.create),
    TE.map(createResponse<InsertionResult>(StatusCodes.Created)),
    TE.mapLeft(createResponse<CustomError>(StatusCodes.BadRequest)),
    TE.fold(T.of, T.of),
  )()
