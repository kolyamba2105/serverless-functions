import { model, models, Schema } from 'mongoose'
import { UserModel } from 'users/model'

const MongooseUserSchema = new Schema({
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

MongooseUserSchema
  .path('email')
  .validate(
    async (email: string) => !await User.countDocuments({ email: email }),
    'E-mail is already in use!',
  )

export const User = models && models.User
  ? models.User
  : model<UserModel>('User', MongooseUserSchema)
