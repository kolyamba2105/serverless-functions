import { APIGatewayEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { connectToMongo } from 'mongo-connect'
import { Mongoose } from 'mongoose'
import { UserDto, UserModel, userModelToUserObject, UserObject } from 'users/user.model'
import UserRepository from 'users/user.repository'
import { createResponse, CustomError, StatusCodes } from 'utils'

export const handle: APIGatewayProxyHandler = ({ body }: APIGatewayEvent) => {
  const validateBody = (): TE.TaskEither<CustomError, UserDto> => pipe(
    body,
    E.fromNullable<CustomError>({ message: 'Body is not provided!' }),
    E.map<string, UserDto>(JSON.parse),
    // TODO add body validation here!
    TE.fromEither,
  )

  return pipe(
    TE.chain<CustomError, Mongoose, UserDto>(validateBody)(connectToMongo),
    TE.chain<CustomError, UserDto, UserModel>(UserRepository.save),
    TE.map<UserModel, UserObject>(userModelToUserObject),
    TE.map<UserObject, APIGatewayProxyResult>(createResponse<UserObject>(StatusCodes.Created)),
    TE.mapLeft<CustomError, APIGatewayProxyResult>(createResponse(StatusCodes.BadRequest)),
    TE.fold(T.of, T.of),
  )()
}
