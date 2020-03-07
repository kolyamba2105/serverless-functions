import { User as UserType } from 'users/validation'
import { MongoModel } from 'utils'

export type UserObject = UserType & {
  id: string,
}

export type UserModel = MongoModel & UserType

export const userModelToUserObject = ({ _id, ...rest }: UserModel): UserObject => ({ id: _id, ...rest })
