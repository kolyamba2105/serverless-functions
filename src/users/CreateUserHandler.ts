import { APIGatewayEvent, APIGatewayProxyHandler } from 'aws-lambda'
import { connectToMongo } from 'mongo-connect'
import User, { demoUser, UserDemo, UserFields } from 'users/User'
import { createResponse, StatusCodes } from 'utils'


export const handle: APIGatewayProxyHandler = (event: APIGatewayEvent) => {
  connectToMongo()

  const { firstName, lastName, email, occupation, dateOfBirth } = JSON.parse(event.body) as UserFields

  const user = new User({
    firstName,
    lastName,
    email,
    occupation,
    dateOfBirth,
  })

  return user.save()
    .then((user: UserFields) => createResponse<UserDemo>(StatusCodes.Created)(demoUser(user)))
    .catch(createResponse<Error>(StatusCodes.InternalServerError))
}
