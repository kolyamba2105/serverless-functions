import { APIGatewayProxyResult } from 'aws-lambda'
import * as E from 'fp-ts/lib/Either'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import { pipe } from 'fp-ts/lib/pipeable'
import * as TE from 'fp-ts/lib/TaskEither'

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

export const validateBody = <T>(validationFn: (body: unknown) => E.Either<CustomError, T>) => (body: string | null): TE.TaskEither<CustomError, T> =>
  pipe(
    body,
    E.fromNullable<CustomError>({ message: 'Body is not provided!' }),
    E.chain<CustomError, NonNullable<string>, unknown>((body: NonNullable<string>) => E.parseJSON<CustomError>(body, toError)),
    E.chain<CustomError, unknown, T>(validationFn),
    TE.fromEither,
  )
