import { APIGatewayProxyResult } from 'aws-lambda'
import * as E from 'fp-ts/lib/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import { Types } from 'mongoose'

export enum StatusCodes {
  OK = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  NotFound = 404,
  InternalServerError = 500,
}

export type CustomError = {
  message: string,
}

export const isObjectIdValid = (id: string): E.Either<CustomError, string> => Types.ObjectId.isValid(id)
  ? E.right(id)
  : E.left({ message: 'Invalid user ID!' })

export const validateId = (id: string) => (): TE.TaskEither<CustomError, string> => TE.fromEither(isObjectIdValid(id))

export const createBody = <T>(value: T): string => JSON.stringify(value, null, 2)

export const createResponse = <T>(statusCode: StatusCodes) => (value: T): APIGatewayProxyResult => ({
  statusCode,
  body: createBody<T>(value),
})

export const onError = ({ message }: Error): CustomError => ({ message })
