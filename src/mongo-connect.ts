import credentials from 'credentials'
import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { connect, Db, MongoClient } from 'mongodb'
import { CustomError, toError } from 'utils'

export const establishConnection: T.Task<MongoClient> = () => {
  const { mongo: { uri, user, password } } = credentials

  return connect(uri, {
    auth: {
      user,
      password,
    },
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
}

export const connectToDatabase: TE.TaskEither<CustomError, Db> = pipe(
  TE.tryCatch(establishConnection, toError),
  TE.map((mongoClient: MongoClient) => mongoClient.db()),
)
