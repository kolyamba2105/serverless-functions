import { Document, model, models, Schema } from 'mongoose'

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
})

UserSchema
  .path('email')
  .validate(
    async (email: string) => !await User.countDocuments({ email: email }),
    'E-mail is already in use!',
  )

export type UserObject = {
  id: string,
  name: string,
  email: string,
  dateOfBirth: Date,
}

export type UserDto = Omit<UserObject, 'id'>

export type UserModel = Document & UserDto

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

export const User = models && models.User
  ? models.User
  : model<UserModel>('User', UserSchema)
