import credentials from 'credentials'
import mongoose from 'mongoose'

export const connectToMongo = () => {
  const { mongoUser: user, mongoPassword: password } = credentials

  console.log(`mongodb://${user}:${password}@ds155825.mlab.com:55825/serverless-database`)

  mongoose
    .connect(
      `mongodb://${user}:${password}@ds155825.mlab.com:55825/serverless-database`,
      {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    )
    .catch(console.log)
}
