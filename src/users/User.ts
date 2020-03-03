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
  __v: number,
}

export type User = Omit<UserObject, '__v'>

export const userObjectToUser = (
  {
    id,
    firstName,
    lastName,
    email,
    occupation,
    dateOfBirth,
  }: UserObject
): User => ({
  id,
  firstName,
  lastName,
  email,
  occupation,
  dateOfBirth,
})

export type UserDto = Omit<User, 'id'>

export type UserModel = Document & UserDto

// TODO: fix it somehow, it's not supposed to work like this :)
export default models && models.User
  ? models.User
  : model<UserModel>('User', UserSchema)
