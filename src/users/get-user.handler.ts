import { APIGatewayEvent, APIGatewayProxyHandler } from 'aws-lambda'
import { connectionError, connectToMongo } from 'mongo-connect'
import { DocumentQuery } from 'mongoose'
import User, { UserFields, UserModel } from 'users/user'
import { createResponse, CustomError, isIdValid, StatusCodes } from 'utils'

export const handle: APIGatewayProxyHandler = ({ pathParameters: { id } }: APIGatewayEvent) => {
  const getUser = () => new Promise((
    resolve: (documentQuery: DocumentQuery<UserFields, UserModel>) => void,
    reject: (error: CustomError) => void,
  ) => {
    if (isIdValid(id)) {
      resolve(User.findById(id))
    } else {
      reject({ message: 'Invalid id!' })
    }
  })

  const onFulfilled = (user: UserFields | null) => user
    ? createResponse<UserFields>(StatusCodes.OK)(user)
    : createResponse<CustomError>(StatusCodes.NotFound)({ message: 'User not found!' })

  const onRejected = ({ message }: CustomError) => createResponse<CustomError>(StatusCodes.BadRequest)({ message })

  const onHandlerError = ({ message }: Error) => createResponse<CustomError>(StatusCodes.InternalServerError)({ message })

  return connectToMongo()
    .then(getUser, connectionError)
    .then(onFulfilled, onRejected)
    .catch(onHandlerError)
}
