import credentials from 'credentials'
import { connect } from 'mongoose'

export const connectToMongo = () => {
  const { mongoUser: user, mongoPassword: password } = credentials

  return connect(
    `mongodb://${user}:${password}@ds155825.mlab.com:55825/serverless-database`,
    {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
}
