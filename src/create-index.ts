import { pipe } from 'fp-ts/lib/pipeable'
import * as TE from 'fp-ts/lib/TaskEither'
import { Collection } from 'mongodb'
import { UserModel } from 'users/model/user.model'
import { usersCollection } from 'users/repository/user.repository'
import { CustomError, toError } from 'utils'

const createIndex = <Type>(collection: TE.TaskEither<CustomError, Collection<Type>>) => (
  field: string
): TE.TaskEither<CustomError, any> => pipe(
  collection,
  TE.map((c: Collection<Type>): TE.TaskEither<CustomError, any> => TE.tryCatch(() => c.createIndex(field), toError)),
)

// it just doesnt' work...
createIndex<UserModel>(usersCollection)('email')().then(console.log)
