import { APIGatewayProxyResult } from 'aws-lambda'
import { Either, left, right } from 'fp-ts/lib/Either'
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

export const isObjectIdValid = (id: string): Either<CustomError, string> => Types.ObjectId.isValid(id)
  ? right(id)
  : left({ message: 'Invalid user ID!' })

export const createBody = <T>(value: T): string => JSON.stringify(value, null, 2)

export const createResponse = <T>(statusCode: StatusCodes) => (value: T): APIGatewayProxyResult => ({
  statusCode,
  body: createBody<T>(value),
})

export const onRejected = ({ message }: Error): CustomError => ({ message })
