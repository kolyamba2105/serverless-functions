import { APIGatewayProxyHandler } from 'aws-lambda'
import { pipe } from 'fp-ts/lib/pipeable'
import { chain, map, Task } from 'fp-ts/lib/Task'
import { establishConnection } from 'mongo-connect'
import UserRepository, { User } from 'users/user'
import { createResponse, StatusCodes } from 'utils'

const getUsers = (): Task<ReadonlyArray<User>> => () => UserRepository.find().exec()

export const handle: APIGatewayProxyHandler = () => pipe(
  chain(getUsers)(establishConnection),
  map(createResponse<ReadonlyArray<User>>(StatusCodes.OK)),
)()
