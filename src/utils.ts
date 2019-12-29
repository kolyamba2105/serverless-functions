export enum StatusCodes {
  OK = 200,
  Created = 201,
  NotFound = 404,
  InternalServerError = 500,
}

export type CustomError = {
  message: string,
}

export const createBody = <T>(value: T): string => JSON.stringify(value, null, 2)

export const createResponse = <T>(statusCode: StatusCodes) => (value: T) => ({
  statusCode,
  body: createBody<T>(value),
})
