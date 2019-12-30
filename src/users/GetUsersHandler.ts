import { APIGatewayProxyHandler } from 'aws-lambda'
import { connectToMongo } from 'mongo-connect'
import Users, { UserFields } from 'users/User'
import { createResponse, StatusCodes } from 'utils'

export const handle: APIGatewayProxyHandler = () => {
  const getUsers = () => Users.find()

  return connectToMongo()
    .then(getUsers)
    .then(createResponse<ReadonlyArray<UserFields>>(StatusCodes.OK))
    .catch(createResponse<Error>(StatusCodes.InternalServerError))
}
