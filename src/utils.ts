import { APIGatewayProxyResult } from 'aws-lambda'
import { Types } from 'mongoose'

export enum StatusCodes {
  OK = 200,
  Created = 201,
  BadRequest = 400,
  NotFound = 404,
  InternalServerError = 500,
}

export type CustomError = {
  message: string,
}

export const isIdValid = (id: string): boolean => Types.ObjectId.isValid(id)

export const createBody = <T>(value: T): string => JSON.stringify(value, null, 2)

export const createResponse = <T>(statusCode: StatusCodes) => (value: T): APIGatewayProxyResult => ({
  statusCode,
  body: createBody<T>(value),
})
