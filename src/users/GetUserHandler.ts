import { APIGatewayEvent, APIGatewayProxyHandler } from 'aws-lambda'
import { connectToMongo } from 'mongo-connect'
import User, { UserFields } from 'users/User'
import { createResponse, CustomError, StatusCodes } from 'utils'

export const handle: APIGatewayProxyHandler = (event: APIGatewayEvent) => {
  connectToMongo()

  const { pathParameters: { id } } = event

  return User.findById(id)
    .then((user: UserFields | null) => user
      ? createResponse<UserFields>(StatusCodes.OK)(user)
      : createResponse<CustomError>(StatusCodes.NotFound)({ message: 'User not found!' }))
    .catch(createResponse<Error>(StatusCodes.InternalServerError))
}
