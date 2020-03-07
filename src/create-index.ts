import { pipe } from 'fp-ts/lib/pipeable'
import * as TE from 'fp-ts/lib/TaskEither'
import { Collection } from 'mongodb'
import { UserModel } from 'users/model'
import { CustomError, getCollection, MongoModel, toError } from 'utils'

const createIndex = <Model extends MongoModel>(collection: TE.TaskEither<CustomError, Collection<Model>>) => (
  field: string
): TE.TaskEither<CustomError, any> => pipe(
  collection,
  TE.map((c: Collection<Model>): TE.TaskEither<CustomError, any> => TE.tryCatch(() => c.createIndex(field), toError)),
  TE.mapLeft(toError),
)

// it just doesnt' work...
const collection = getCollection<UserModel>('users')

createIndex(collection)('email')().then(console.log)
