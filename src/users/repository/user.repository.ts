import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import * as TE from 'fp-ts/lib/TaskEither'
import { Collection } from 'mongodb'
import { UserModel } from 'users/model'
import { ExactUserPayload, User as UserDto } from 'users/validation'
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

const usersCollection: TE.TaskEither<CustomError, Collection<UserModel>> = getCollection('users')

export const UserRepository = {
  find: (): TE.TaskEither<CustomError, ReadonlyArray<UserModel>> => pipe(
    usersCollection,
    TE.map(find),
    TE.chain(TE.rightTask),
    TE.mapLeft(toError),
  ),
  findById: (id: string): TE.TaskEither<CustomError, O.Option<UserModel>> => pipe(
    usersCollection,
    TE.map(findById<UserModel>(id)),
    TE.chain(TE.rightTask),
    TE.mapLeft(toError),
  ),
  create: (dto: UserDto): TE.TaskEither<CustomError, E.Either<CustomError, InsertionResult>> => pipe(
    usersCollection,
    TE.map(insertOne<UserModel, UserDto>(dto)),
    TE.chain(TE.rightTask),
    TE.mapLeft(toError),
  ),
  update: ([id, payload]: [string, ExactUserPayload]) => pipe(
    usersCollection,
    TE.chain(findOneAndUpdate([id, payload])),
    TE.mapLeft(toError),
  ),
  findByIdAndDelete: (id: string): TE.TaskEither<CustomError, O.Option<UserModel>> => pipe(
    usersCollection,
    TE.map(findByIdAndDelete<UserModel>(id)),
    TE.chain(TE.rightTask),
    TE.mapLeft(toError),
  ),
}
