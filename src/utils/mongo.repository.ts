import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import * as TE from 'fp-ts/lib/TaskEither'
import { Collection, Db, FilterQuery, ObjectId } from 'mongodb'
import { CustomError, dbConnection, MongoModel, toError } from 'utils'

export const getCollection = <T>(
  collectionName: string
): TE.TaskEither<CustomError, Collection<MongoModel<T>>> =>
  pipe(
    dbConnection,
    TE.map((db: Db) => db.collection<MongoModel<T>>(collectionName)),
    TE.mapLeft(toError),
  )

export const find = <M>(
  collection: Collection<MongoModel<M>>
): TE.TaskEither<CustomError, ReadonlyArray<MongoModel<M>>> =>
  TE.tryCatch(
    () => collection.find().toArray(),
    toError,
  )

export const findById = <M>(id: string) => (
  collection: Collection<MongoModel<M>>
): TE.TaskEither<CustomError, O.Option<MongoModel<M>>> =>
  TE.tryCatch(
    () => collection
      .findOne({ _id: new ObjectId(id) } as FilterQuery<MongoModel<M>>)
      .then(O.fromNullable),
    toError,
  )

export type InsertionResult = Readonly<{ id: string }>

export const insertOne = <M>(
  dto: M
) => (
  collection: Collection<MongoModel<M>>
): TE.TaskEither<CustomError, InsertionResult> =>
  TE.tryCatch(
    () => collection.insertOne(dto as any).then(({ insertedId: id }) => ({ id })),
    toError,
  )

export const findOneAndUpdate = <M, Payload extends Partial<MongoModel<M>>>(
  [id, payload]: [string, Payload]
) => (
  collection: Collection<MongoModel<M>>
): TE.TaskEither<CustomError, O.Option<MongoModel<M>>> =>
  TE.tryCatch(
    () => collection
      .findOneAndUpdate({ _id: new ObjectId(id) } as FilterQuery<MongoModel<M>>, { $set: { ...payload } })
      .then(({ value }) => O.fromNullable(value)),
    toError,
  )

export const findByIdAndDelete = <M>(
  id: string
) => (
  collection: Collection<MongoModel<M>>
): TE.TaskEither<CustomError, O.Option<MongoModel<M>>> =>
  TE.tryCatch(
    () => collection
      .findOneAndDelete({ _id: new ObjectId(id) } as FilterQuery<MongoModel<M>>)
      .then(({ value }) => O.fromNullable(value)),
    toError
  )
