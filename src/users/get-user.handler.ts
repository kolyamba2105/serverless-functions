import { APIGatewayEvent, APIGatewayProxyHandler } from 'aws-lambda'
import { isSome, none, Option, some } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import { map as mapTask, of, Task } from 'fp-ts/lib/Task'
import { chain, fold, fromEither, map, mapLeft, TaskEither } from 'fp-ts/lib/TaskEither'
import { identity } from 'io-ts'
import { connectToMongo } from 'mongo-connect'
import UserRepository, { User, UserObject, userObjectToUser } from 'users/user'
import { createResponse, CustomError, isObjectIdValid, StatusCodes } from 'utils'

export const handle: APIGatewayProxyHandler = ({ pathParameters: { id } }: APIGatewayEvent) => {
  const validateId = (): TaskEither<CustomError, string> => fromEither(isObjectIdValid(id))

  const getUser = (id: string): Task<UserObject> => () => UserRepository.findById(id).exec()

  const toResponse = (result: UserObject) => {
    const user: Option<UserObject> = result !== null ? some(result) : none

    return isSome(user)
      ? createResponse<User>(StatusCodes.OK)(userObjectToUser(user.value))
      : createResponse<CustomError>(StatusCodes.NotFound)({ message: 'User not found!' })
  }

  return pipe(
    chain(validateId)(connectToMongo),
    map(getUser),
    map(mapTask(toResponse)),
    mapLeft(createResponse(StatusCodes.BadRequest)),
    fold(of, identity),
  )()
}
