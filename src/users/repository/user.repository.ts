import { fromNullable, Option } from 'fp-ts/lib/Option'
import { Task } from 'fp-ts/lib/Task'
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither'
import { User, UserModel } from 'users/model'
import { User as UserDto } from 'users/validation'
import { CustomError, onError } from 'utils'

export const UserRepository = {
  find: (): Task<ReadonlyArray<UserModel>> => () => User.find().then(),
  findById: (id: string): Task<Option<UserModel>> => () => User.findById(id).then(fromNullable),
  save: (dto: UserDto): TaskEither<CustomError, UserModel> => tryCatch(() => new User(dto).save(), onError),
  findByIdAndDelete: (id: string): Task<Option<UserModel>> => () => User.findByIdAndRemove(id).then(fromNullable),
}
