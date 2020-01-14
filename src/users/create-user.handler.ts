import { APIGatewayEvent, APIGatewayProxyHandler } from 'aws-lambda'
import { connectionError, connectToMongo } from 'mongo-connect'
import User, { demoUser, UserDemo, UserFields } from 'users/user'
import { createResponse, CustomError, StatusCodes } from 'utils'

export const handle: APIGatewayProxyHandler = ({ body }: APIGatewayEvent) => {
  const createUser = () => {
    if (body) {
      const { firstName, lastName, email, occupation, dateOfBirth } = JSON.parse(body) as UserFields

      const user = new User({
        firstName,
        lastName,
        email,
        occupation,
        dateOfBirth,
      })

      return user.save()
    }
  }

  const onFulfilled = (user: UserFields) => createResponse<UserDemo>(StatusCodes.Created)(demoUser(user))

  const onRejected = ({ message }: Error) => createResponse<CustomError>(StatusCodes.BadRequest)({ message })

  const onHandlerError = ({ message }: Error) => createResponse<CustomError>(StatusCodes.InternalServerError)({ message })

  return connectToMongo()
    .then(createUser, connectionError)
    .then(onFulfilled, onRejected)
    .catch(onHandlerError)
}
