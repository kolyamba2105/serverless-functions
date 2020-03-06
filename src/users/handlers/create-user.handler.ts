import { APIGatewayEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { connectToMongo } from 'mongo-connect'
import { UserModel, userModelToUserObject, UserObject } from 'users/model'
import { UserRepository } from 'users/repository'
import { User, validateUser } from 'users/validation'
import { createResponse, CustomError, onError, StatusCodes } from 'utils'

export const handle: APIGatewayProxyHandler = ({ body }: APIGatewayEvent) => {
  const validateBody = (): TE.TaskEither<CustomError, User> => pipe(
    body,
    E.fromNullable<CustomError>({ message: 'Body is not provided!' }),
    E.map<NonNullable<string>, E.Either<CustomError, unknown>>((body: NonNullable<string>) => E.parseJSON<CustomError>(body, onError)),
    E.chain<CustomError, E.Either<CustomError, unknown>, E.Either<CustomError, User>>(E.map(validateUser)),
    E.flatten,
    TE.fromEither,
  )

  return pipe(
    TE.chain<CustomError, unknown, User>(validateBody)(connectToMongo),
    TE.chain<CustomError, User, UserModel>(UserRepository.save),
    TE.map<UserModel, UserObject>(userModelToUserObject),
    TE.map<UserObject, APIGatewayProxyResult>(createResponse<UserObject>(StatusCodes.Created)),
    TE.mapLeft<CustomError, APIGatewayProxyResult>(createResponse(StatusCodes.BadRequest)),
    TE.fold(T.of, T.of),
  )()
}
