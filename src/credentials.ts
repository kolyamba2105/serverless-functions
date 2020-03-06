import { config } from 'dotenv'

config()

export default {
  mongo: {
    uri: process.env.MONGO_URI,
    user: process.env.MONGO_USER,
    password: process.env.MONGO_PASSWORD,
  },
}
