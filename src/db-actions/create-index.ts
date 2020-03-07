import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { Collection, IndexOptions } from 'mongodb'
import { UserModel } from 'users/model'
import { CustomError, getCollection, MongoModel, toError } from 'utils'

const createIndex = <Model extends MongoModel>(
  collection: TE.TaskEither<CustomError, Collection<Model>>
) => (
  field: string
) => (
  indexOptions: IndexOptions
): T.Task<string> => {
  const toCreateIndexTaskEither = (
    collection: Collection<Model>
  ): TE.TaskEither<CustomError, string> => TE.tryCatch(
    () => collection.createIndex(field, indexOptions),
    toError
  )

  return pipe(
    collection,
    TE.chain(toCreateIndexTaskEither),
    TE.mapLeft<CustomError, string>((error: CustomError) => (error.message as string)),
    TE.fold(T.of, T.of),
  )
}

const collection = getCollection<UserModel>('users')

createIndex(collection)('email')({ unique: true })().then(console.log)
