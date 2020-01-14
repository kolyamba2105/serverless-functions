import credentials from 'credentials'
import { connect } from 'mongoose'
import { createResponse, CustomError, StatusCodes } from 'utils'

export const connectToMongo = () => {
  const { mongoUser: user, mongoPassword: pass } = credentials

  return connect(
    `mongodb://ds155825.mlab.com:55825/serverless-database`,
    {
      user,
      pass,
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
}

export const connectionError = ({ message }: Error) => createResponse<CustomError>(StatusCodes.InternalServerError)({ message })
