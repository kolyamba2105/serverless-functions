import { APIGatewayProxyHandler } from 'aws-lambda'
import { pipe } from 'fp-ts/lib/pipeable'
import * as A from 'fp-ts/lib/ReadonlyArray'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { Map } from 'immutable'
import { connectToMongo } from 'mongo-connect'
import { Mongoose } from 'mongoose'
import { User, UserObject, userObjectToUser } from 'users/user'
import { find } from 'users/user.repository'
import { createResponse, CustomError, StatusCodes } from 'utils'

export const handle: APIGatewayProxyHandler = () => {
  const toUsersMap = (
    users: ReadonlyArray<UserObject>
  ) => Map<string, User>(
    A.map((user: UserObject): [string, User] => [user.id, userObjectToUser(user)])(users)
  )

  return pipe(
    connectToMongo,
    TE.map<Mongoose, T.Task<ReadonlyArray<UserObject>>>(find),
    TE.chain(TE.rightTask),
    TE.map(toUsersMap),
    TE.map(createResponse<Map<string, User>>(StatusCodes.OK)),
    TE.mapLeft(createResponse<CustomError>(StatusCodes.InternalServerError)),
    TE.fold(T.of, T.of)
  )()
}
