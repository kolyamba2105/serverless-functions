import { User as UserType } from 'users/validation'

export type UserObject = {
  id: string,
  name: string,
  email: string,
  dateOfBirth: Date,
}

export type UserModel = UserType & {
  readonly _id: string,
}

export const userModelToUserObject = (
  {
    _id,
    name,
    email,
    dateOfBirth,
  }: UserModel
): UserObject => ({
  id: _id,
  name,
  email,
  dateOfBirth,
})
