import { fromNullable, Option } from 'fp-ts/lib/Option'
import { Task } from 'fp-ts/lib/Task'
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither'
import { CustomError, onRejected } from 'utils'
import User, { UserDto, UserObject } from './user'

export const find = (): Task<ReadonlyArray<UserObject>> => () => User.find().then()

export const findById = (id: string): Task<Option<UserObject>> => () => User.findById(id).then(fromNullable)

export const save = (dto: UserDto): TaskEither<CustomError, UserObject> => tryCatch(() => new User(dto).save(), onRejected)

export const findByIdAndDelete = (id: string): Task<Option<UserObject>> => () => User.findByIdAndRemove(id).then(fromNullable)
