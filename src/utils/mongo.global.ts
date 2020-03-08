import * as E from 'fp-ts/lib/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import { CustomError } from 'utils/aws.lambda'
import isMongoId from 'validator/lib/isMongoId'

export type MongoModel<T> = Readonly<{ _id: string } & T>

export type ObjectType<T> = Readonly<{ id: string } & T>

const isObjectIdValid = (id: string): E.Either<CustomError, string> => isMongoId(id)
  ? E.right(id)
  : E.left({ message: 'Invalid user ID!' })

export const validateId = (id: string): TE.TaskEither<CustomError, string> => TE.fromEither(isObjectIdValid(id))
