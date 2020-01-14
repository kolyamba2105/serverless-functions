import { APIGatewayProxyHandler } from 'aws-lambda'
import { connectToMongo } from 'mongo-connect'
import { DocumentQuery } from 'mongoose'
import Users, { UserFields, UserModel } from 'users/user'
import { createResponse, StatusCodes } from 'utils'

export const handle: APIGatewayProxyHandler = () => {
  const getUsers = () => Users.find() as DocumentQuery<ReadonlyArray<UserModel>, UserModel>

  return connectToMongo()
    .then(getUsers)
    .then(createResponse<ReadonlyArray<UserFields>>(StatusCodes.OK))
    .catch(createResponse<Error>(StatusCodes.InternalServerError))
}
