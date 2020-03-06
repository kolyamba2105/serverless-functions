import { APIGatewayProxyHandler } from 'aws-lambda'
import { pipe } from 'fp-ts/lib/pipeable'
import * as A from 'fp-ts/lib/ReadonlyArray'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { Map } from 'immutable'
import { connectToMongo } from 'mongo-connect'
import { Mongoose } from 'mongoose'
import { UserModel, userModelToUserObject, UserObject } from 'users/model'
import { UserRepository } from 'users/repository'
import { createResponse, CustomError, StatusCodes } from 'utils'

export const handle: APIGatewayProxyHandler = () => {
  const toUsersMap = (
    users: ReadonlyArray<UserModel>
  ) => Map<string, UserObject>(
    A.map((user: UserModel): [string, UserObject] => [user.id, userModelToUserObject(user)])(users)
  )

  return pipe(
    connectToMongo,
    TE.map<Mongoose, T.Task<ReadonlyArray<UserModel>>>(UserRepository.find),
    TE.chain(TE.rightTask),
    TE.map(toUsersMap),
    TE.map(createResponse<Map<string, UserObject>>(StatusCodes.OK)),
    TE.mapLeft(createResponse<CustomError>(StatusCodes.InternalServerError)),
    TE.fold(T.of, T.of)
  )()
}
