import { APIGatewayEvent, APIGatewayProxyHandler } from 'aws-lambda'
import { connectToMongo } from 'mongo-connect'
import User, { demoUser, UserDemo, UserFields } from 'users/User'
import { createResponse, CustomError, StatusCodes } from 'utils'

export const handle: APIGatewayProxyHandler = (event: APIGatewayEvent) => {
  connectToMongo()

  const { pathParameters: { id } } = event

  return User.findByIdAndDelete(id)
    .then((user: UserFields | null) => user
      ? createResponse<UserDemo>(StatusCodes.OK)(demoUser(user))
      : createResponse<CustomError>(StatusCodes.NotFound)({ message: 'User not found!' }))
    .catch(createResponse<Error>(StatusCodes.InternalServerError))
}
