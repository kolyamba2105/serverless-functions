import { userModelToUserObject, UserObject } from 'api/users/model'
import { UserRepository } from 'api/users/repository'
import { APIGatewayProxyHandler } from 'aws-lambda'
import { pipe } from 'fp-ts/lib/pipeable'
import * as Array from 'fp-ts/lib/ReadonlyArray'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { Map } from 'immutable'
import { createResponse, CustomError, StatusCodes } from 'utils'

export const handle: APIGatewayProxyHandler = () => {
  const toUsersMap = (users: ReadonlyArray<UserObject>): Map<string, UserObject> =>
    Map<string, UserObject>(
      Array.map((user: UserObject): [string, UserObject] => [user.id, user])(users)
    )

  return pipe(
    UserRepository.find(),
    TE.map(Array.map(userModelToUserObject)),
    TE.map(toUsersMap),
    TE.map(createResponse<Map<string, UserObject>>(StatusCodes.OK)),
    TE.mapLeft(createResponse<CustomError>(StatusCodes.InternalServerError)),
    TE.fold(T.of, T.of)
  )()
}
