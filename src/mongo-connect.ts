import credentials from 'credentials'
import { Task } from 'fp-ts/lib/Task'
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither'
import { connect, Mongoose } from 'mongoose'
import { CustomError, onError } from 'utils'

export const establishConnection: Task<Mongoose> = () => {
  const { mongo: { uri, user: user, password: pass } } = credentials

  return connect(
    uri,
    {
      user,
      pass,
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
}

export const connectToMongo: TaskEither<CustomError, Mongoose> = tryCatch(establishConnection, onError)
