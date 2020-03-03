import { APIGatewayProxyHandler } from 'aws-lambda'
import { pipe } from 'fp-ts/lib/pipeable'
import { chain, map, Task } from 'fp-ts/lib/Task'
import { Map } from 'immutable'
import { establishConnection } from 'mongo-connect'
import UserRepository, { User, UserObject, userObjectToUser } from 'users/user'
import { createResponse, StatusCodes } from 'utils'

export const handle: APIGatewayProxyHandler = () => {
  const getUsers = (): Task<ReadonlyArray<UserObject>> => () => UserRepository.find().exec()

  const toUsersMap = (users: ReadonlyArray<UserObject>) => Map<string, User>(users.map((user: UserObject) => [user.id, userObjectToUser(user)]))

  return pipe(
    chain(getUsers)(establishConnection),
    map(toUsersMap),
    map(createResponse<Map<string, User>>(StatusCodes.OK)),
  )()
}
