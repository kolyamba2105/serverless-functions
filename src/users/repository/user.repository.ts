import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { Collection, FilterQuery, InsertOneWriteOpResult, ObjectId } from 'mongodb'
import { UserModel } from 'users/model'
import { ExactUserPayload, User as UserDto } from 'users/validation'
import { CustomError, toError } from 'utils'
import { getCollection } from 'utils/mongo.utils'

const usersCollection: TE.TaskEither<CustomError, Collection<UserModel>> = getCollection('users')

export const UserRepository = {
  find: (): TE.TaskEither<CustomError, ReadonlyArray<UserModel>> => {
    const toFindTask = (collection: Collection<UserModel>): T.Task<ReadonlyArray<UserModel>> => () => collection
      .find()
      .toArray()

    return pipe(
      usersCollection,
      TE.map(toFindTask),
      TE.chain(TE.rightTask),
      TE.mapLeft(toError),
    )
  },
  findById: (id: string): TE.TaskEither<CustomError, O.Option<UserModel>> => {
    const toFindByIdTask = (
      collection: Collection<UserModel>
    ): T.Task<O.Option<UserModel>> => () => collection
      .findOne({ _id: new ObjectId(id) } as FilterQuery<UserModel>)
      .then(O.fromNullable)

    return pipe(
      usersCollection,
      TE.map(toFindByIdTask),
      TE.chain(TE.rightTask),
      TE.mapLeft(toError),
    )
  },
  save: (dto: UserDto): TE.TaskEither<CustomError, E.Either<CustomError, number>> => {
    const toResult = (v: InsertOneWriteOpResult<UserModel>) => v.result.ok

    const toInsertOneTask = (
      collection: Collection<UserModel>
    ): TE.TaskEither<CustomError, number> => TE.tryCatch(
      () => collection
        .insertOne(dto as UserModel)
        .then(toResult),
      toError
    )

    return pipe(
      usersCollection,
      TE.map(toInsertOneTask),
      TE.chain(TE.rightTask),
      TE.mapLeft(toError),
    )
  },
  update: ([id, payload]: [string, ExactUserPayload]) => {
    const toUpdateOneTask = (
      collection: Collection<UserModel>
    ): TE.TaskEither<CustomError, O.Option<UserModel>> => TE.tryCatch(
      () => collection
        .findOneAndUpdate({ _id: new ObjectId(id) } as FilterQuery<UserModel>, { $set: { ...payload } })
        .then(({ value }) => O.fromNullable(value)),
      toError,
    )

    return pipe(
      usersCollection,
      TE.chain(toUpdateOneTask),
      TE.mapLeft(toError),
    )
  },
  findByIdAndDelete: (id: string): TE.TaskEither<CustomError, O.Option<UserModel>> => {
    const toFindByIdAndDeleteTask = (
      collection: Collection<UserModel>
    ): T.Task<O.Option<UserModel>> => () => collection
      .findOneAndDelete({ _id: new ObjectId(id) } as FilterQuery<UserModel>)
      .then(({ value }) => O.fromNullable(value))

    return pipe(
      usersCollection,
      TE.map(toFindByIdAndDeleteTask),
      TE.chain(TE.rightTask),
      TE.mapLeft(toError),
    )
  },
}
