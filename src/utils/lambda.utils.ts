import { APIGatewayProxyResult } from 'aws-lambda'
import * as NEA from 'fp-ts/lib/NonEmptyArray'

export enum StatusCodes {
  OK = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  NotFound = 404,
  InternalServerError = 500,
}

export type CustomError = {
  message: string | Array<string> | NEA.NonEmptyArray<string>,
}

export const createBody = <T>(value: T): string => JSON.stringify(value, null, 2)

export const createResponse = <T>(statusCode: StatusCodes) => (value: T): APIGatewayProxyResult => ({
  statusCode,
  body: createBody<T>(value),
})

export const toError = ({ message }: Error): CustomError => ({ message })
