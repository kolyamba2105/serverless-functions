import { config } from 'dotenv'

config()

export default {
  mongo: {
    uri: process.env.MONGO_URI,
    database: process.env.MONGO_DB,
    user: process.env.MONGO_USER,
    password: process.env.MONGO_PASSWORD,
  },
}
