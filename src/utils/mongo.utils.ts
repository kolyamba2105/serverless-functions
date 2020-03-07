import credentials from 'credentials'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { Collection, connect, Db, MongoClient } from 'mongodb'
import { CustomError, toError } from 'utils/lambda.utils'
import isMongoId from 'validator/lib/isMongoId'

type AuthCredentials = Readonly<{ user: string, password: string }>

export const establishConnection = (
  uri: string
) => (
  {
    user,
    password,
  }: AuthCredentials
): T.Task<MongoClient> => () => connect(uri, {
  auth: {
    user,
    password,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const connectToDatabase = (uri: string) => (credentials: AuthCredentials): TE.TaskEither<CustomError, Db> => pipe(
  TE.tryCatch(establishConnection(uri)(credentials), toError),
  TE.map((mongoClient: MongoClient) => mongoClient.db()),
)

const { mongo: { uri, user, password } } = credentials

const dbConnection = connectToDatabase(uri)({ user, password })

export type MongoModel = Readonly<{ _id: string }>

export const getCollection = <Model extends MongoModel>(
  collectionName: string
): TE.TaskEither<CustomError, Collection<Model>> => pipe(
  dbConnection,
  TE.map((db: Db) => db.collection<Model>(collectionName)),
  TE.mapLeft(toError),
)

const isObjectIdValid = (id: string): E.Either<CustomError, string> => isMongoId(id)
  ? E.right(id)
  : E.left({ message: 'Invalid user ID!' })

export const validateId = (id: string) => (): TE.TaskEither<CustomError, string> => TE.fromEither(isObjectIdValid(id))
