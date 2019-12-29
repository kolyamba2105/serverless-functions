import { APIGatewayProxyHandler } from 'aws-lambda'
import { connectToMongo } from 'mongo-connect'
import 'source-map-support/register'
import Users, { UserFields } from 'users/User'
import { createResponse, StatusCodes } from 'utils'

export const handle: APIGatewayProxyHandler = async () => {
  connectToMongo()

  return Users.find()
    .then(createResponse<ReadonlyArray<UserFields>>(StatusCodes.OK))
    .catch(createResponse<Error>(StatusCodes.InternalServerError))
}
