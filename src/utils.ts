import { APIGatewayProxyResult } from 'aws-lambda'
import * as E from 'fp-ts/lib/Either'
import * as A from 'fp-ts/lib/NonEmptyArray'
import * as TE from 'fp-ts/lib/TaskEither'
import isMongoId from 'validator/lib/isMongoId'

export enum StatusCodes {
  OK = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  NotFound = 404,
  InternalServerError = 500,
}

export type CustomError = {
  message: string | A.NonEmptyArray<string>,
}

export const isObjectIdValid = (id: string): E.Either<CustomError, string> => isMongoId(id)
  ? E.right(id)
  : E.left({ message: 'Invalid user ID!' })

export const validateId = (id: string) => (): TE.TaskEither<CustomError, string> => TE.fromEither(isObjectIdValid(id))

export const createBody = <T>(value: T): string => JSON.stringify(value, null, 2)

export const createResponse = <T>(statusCode: StatusCodes) => (value: T): APIGatewayProxyResult => ({
  statusCode,
  body: createBody<T>(value),
})

export const toError = ({ message }: Error): CustomError => ({ message })
