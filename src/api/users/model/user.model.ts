import { User } from 'api/users/validation'
import { MongoModel, ObjectType } from 'utils'

export type UserObject = ObjectType<User>

export type UserModel = MongoModel<User>

export const userModelToUserObject = ({ _id: id, ...props }: UserModel): UserObject => ({ id, ...props })
