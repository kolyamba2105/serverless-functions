import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString'
import { CustomError } from 'utils'

export const DateOfBirth = DateFromISOString

export type DateOfBirth = t.TypeOf<typeof DateOfBirth>

export const validateDateOfBirth = (dateOfBirth: unknown): E.Either<CustomError, Date> =>
  pipe(
    DateFromISOString.decode(dateOfBirth),
    E.mapLeft(() => ({ message: 'Date of birth is invalid or is not provided!' }))
  )
