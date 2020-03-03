import { APIGatewayEvent, APIGatewayProxyHandler } from 'aws-lambda'
import { Either, left, right } from 'fp-ts/lib/Either'
import { isSome, none, Option, some } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import { of } from 'fp-ts/lib/Task'
import { chain, fold, fromEither, map, mapLeft, TaskEither, tryCatch } from 'fp-ts/lib/TaskEither'
import { connectToMongo } from 'mongo-connect'
import UserRepository, { User } from 'users/user'
import { createResponse, CustomError, onRejected, StatusCodes } from 'utils'

export const handle: APIGatewayProxyHandler = ({ body }: APIGatewayEvent) => {
  const validateBody = (body: string | null): Either<CustomError, User> => {
    const option: Option<string> = body ? some(body) : none

    return isSome(option)
      // TODO add validation while parsing
      ? right(JSON.parse(body) as User)
      : left({ message: 'Body is not provided!' })
  }

  const validateBodyTask = (): TaskEither<CustomError, User> => fromEither(validateBody(body))

  const createUser = (user: User) => () => new UserRepository(user).save()

  const createUserTask = (user: User): TaskEither<CustomError, User> => tryCatch(createUser(user), onRejected)

  return pipe(
    chain(validateBodyTask)(connectToMongo),
    chain(createUserTask),
    map(createResponse<User>(StatusCodes.Created)),
    mapLeft(createResponse(StatusCodes.BadRequest)),
    fold(of, of),
  )()
}