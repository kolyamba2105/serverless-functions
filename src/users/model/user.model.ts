import { Document } from 'mongoose'
import { User as UserType } from 'users/validation'

export type UserObject = {
  id: string,
  name: string,
  email: string,
  dateOfBirth: Date,
}

export type UserModel = Document & UserType

export const userModelToUserObject = (
  {
    id,
    name,
    email,
    dateOfBirth,
  }: UserModel
): UserObject => ({
  id,
  name,
  email,
  dateOfBirth,
})
