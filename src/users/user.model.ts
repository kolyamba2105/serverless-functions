import { Document, model, models, Schema } from 'mongoose'

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'First Name is required!'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last Name is required!'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'E-mail is required!'],
    trim: true,
  },
  occupation: {
    type: String,
    required: [true, 'Occupation is required!'],
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of Birth is required!'],
  },
})

UserSchema
  .path('email')
  .validate(
    async (email: string) => !await models.User.countDocuments({ email: email }),
    'E-mail is already in use!',
  )

export type UserObject = {
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  occupation: string,
  dateOfBirth: Date,
}

export type UserDto = Omit<UserObject, 'id'>

export type UserModel = Document & UserDto

export const userModelToUserObject = (
  {
    id,
    firstName,
    lastName,
    email,
    occupation,
    dateOfBirth,
  }: UserModel
): UserObject => ({
  id,
  firstName,
  lastName,
  email,
  occupation,
  dateOfBirth,
})

export const User = models && models.User
  ? models.User
  : model<UserModel>('User', UserSchema)
