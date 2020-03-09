import { User } from 'api/users/validation'
import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { Collection, IndexOptions } from 'mongodb'
import { CustomError, getCollection, MongoModel, toError } from 'utils'

const createIndex = <M>(
  collection: TE.TaskEither<CustomError, Collection<MongoModel<M>>>
) => (
  field: string
) => (
  indexOptions: IndexOptions
): T.Task<string> => {
  const createIndex = (collection: Collection<MongoModel<M>>): TE.TaskEither<CustomError, string> =>
    TE.tryCatch(
      () => collection.createIndex(field, indexOptions),
      toError,
    )

  return pipe(
    collection,
    TE.chain(createIndex),
    TE.mapLeft<CustomError, string>((error: CustomError) => (error.message as string)),
    TE.fold(T.of, T.of),
  )
}

const collection = getCollection<User>('users')

createIndex(collection)('email')({ unique: true })().then(console.log)
