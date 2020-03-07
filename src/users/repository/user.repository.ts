import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import * as TE from 'fp-ts/lib/TaskEither'
import { Collection } from 'mongodb'
import { UserModel } from 'users/model'
import { ExactUserPayload, User } from 'users/validation'
import {
  CustomError,
  find,
  findById,
  findByIdAndDelete,
  findOneAndUpdate,
  getCollection,
  InsertionResult,
  insertOne,
  toError,
} from 'utils'

const usersCollection: TE.TaskEither<CustomError, Collection<UserModel>> = getCollection<User>('users')

export const UserRepository = {
  find: (): TE.TaskEither<CustomError, ReadonlyArray<UserModel>> =>
    pipe(
      usersCollection,
      TE.chain(find),
      TE.mapLeft(toError),
    ),
  findById: (id: string): TE.TaskEither<CustomError, O.Option<UserModel>> =>
    pipe(
      usersCollection,
      TE.chain(findById<User>(id)),
      TE.mapLeft(toError),
    ),
  create: (dto: User): TE.TaskEither<CustomError, InsertionResult> =>
    pipe(
      usersCollection,
      TE.chain(insertOne<User>(dto)),
      TE.mapLeft(toError),
    ),
  update: ([id, payload]: [string, ExactUserPayload]): TE.TaskEither<CustomError, O.Option<UserModel>> =>
    pipe(
      usersCollection,
      TE.chain(findOneAndUpdate([id, payload])),
      TE.mapLeft(toError),
    ),
  findByIdAndDelete: (id: string): TE.TaskEither<CustomError, O.Option<UserModel>> =>
    pipe(
      usersCollection,
      TE.chain(findByIdAndDelete<User>(id)),
      TE.mapLeft(toError),
    ),
}
