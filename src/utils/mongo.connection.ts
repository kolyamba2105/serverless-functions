import credentials from 'credentials'
import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { connect, Db, MongoClient } from 'mongodb'
import { CustomError, toError } from 'utils/aws.lambda'

type AuthCredentials = Readonly<{
  user: string,
  password: string,
}>

export const establishConnection = (
  uri: string
) => (
  {
    user,
    password,
  }: AuthCredentials
) => (
  authSource?: string
): T.Task<MongoClient> => (): Promise<MongoClient> =>
  connect(uri, {
      auth: {
        user,
        password,
      },
      useNewUrlParser: true,
      useUnifiedTopology: true,
      authSource,
    }
  )

const { mongo: { uri, database, user, password } } = credentials

const connection: T.Task<MongoClient> = establishConnection(uri)({ user, password })(database)

const connectToDatabase = (connection: T.Task<MongoClient>) => (dbName: string): TE.TaskEither<CustomError, Db> =>
  pipe(
    TE.tryCatch(connection, toError),
    TE.map((mongoClient: MongoClient) => mongoClient.db(dbName)),
  )

export const dbConnection: TE.TaskEither<CustomError, Db> = connectToDatabase(connection)(database)
