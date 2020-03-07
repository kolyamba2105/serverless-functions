import credentials from 'credentials'
import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { Collection, connect, Db, FilterQuery, MongoClient, ObjectId } from 'mongodb'
import { CustomError, toError } from 'utils/lambda.utils'
import isMongoId from 'validator/lib/isMongoId'

export type MongoModel<T> = Readonly<{ _id: string } & T>

export type ObjectType<T> = Readonly<{ id: string } & T>

type AuthCredentials = Readonly<{ user: string, password: string }>

export const establishConnection = (
  uri: string
) => (
  {
    user,
    password,
  }: AuthCredentials
) => (
  authSource?: string
): T.Task<MongoClient> => () => connect(uri, {
  auth: {
    user,
    password,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource,
})

const connectToDatabase = (
  uri: string
) => (
  credentials: AuthCredentials
) => (
  authSource?: string
) => (
  dbName: string
): TE.TaskEither<CustomError, Db> => pipe(
  TE.tryCatch(establishConnection(uri)(credentials)(authSource), toError),
  TE.map((mongoClient: MongoClient) => mongoClient.db(dbName)),
)

const { mongo: { uri, database, user, password } } = credentials

const dbConnection = connectToDatabase(uri)({ user, password })(database)(database)

export const getCollection = <T>(
  collectionName: string
): TE.TaskEither<CustomError, Collection<MongoModel<T>>> => pipe(
  dbConnection,
  TE.map((db: Db) => db.collection<MongoModel<T>>(collectionName)),
  TE.mapLeft(toError),
)

const isObjectIdValid = (id: string): E.Either<CustomError, string> => isMongoId(id)
  ? E.right(id)
  : E.left({ message: 'Invalid user ID!' })

export const validateId = (id: string) => (): TE.TaskEither<CustomError, string> => TE.fromEither(isObjectIdValid(id))

export const find = <M>(
  collection: Collection<MongoModel<M>>
): T.Task<ReadonlyArray<MongoModel<M>>> => () => collection.find().toArray()

export const findById = <M>(id: string) => (
  collection: Collection<MongoModel<M>>
): T.Task<O.Option<MongoModel<M>>> => () => collection.findOne({ _id: new ObjectId(id) } as FilterQuery<MongoModel<M>>).then(O.fromNullable)

export type InsertionResult = Readonly<{ id: string, ok: number }>

export const insertOne = <M, DTO extends Omit<MongoModel<M>, '_id'>>(dto: DTO) => (
  collection: Collection<MongoModel<M>>
): TE.TaskEither<CustomError, InsertionResult> => {
  const toInsertionResult = ({ insertedId: id, result: { ok } }) => ({ id, ok })

  // TODO better type checking
  return TE.tryCatch(() => collection.insertOne(dto as any).then(toInsertionResult), toError)
}

export const findOneAndUpdate = <M, Payload>([id, payload]: [string, Payload]) => (
  collection: Collection<MongoModel<M>>
): TE.TaskEither<CustomError, O.Option<MongoModel<M>>> => TE.tryCatch(
  () => collection
    .findOneAndUpdate({ _id: new ObjectId(id) } as FilterQuery<MongoModel<M>>, { $set: { ...payload } })
    .then(({ value }) => O.fromNullable(value)),
  toError,
)

export const findByIdAndDelete = <M>(id: string) => (
  collection: Collection<MongoModel<M>>
) => () => collection.findOneAndDelete({ _id: new ObjectId(id) } as FilterQuery<MongoModel<M>>).then(({ value }) => O.fromNullable(value))
