import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString'
import { liftValidation } from 'users/validation/helpers'
import { CustomError } from 'utils'

// cannot make a branded type from DateFromISOString (but actually there is no need to do this)
export const DateOfBirth = DateFromISOString

export type DateOfBirth = t.TypeOf<typeof DateOfBirth>

export const validateDateOfBirth = (dateOfBirth: unknown): E.Either<CustomError, Date> =>
  pipe(
    DateFromISOString.decode(dateOfBirth),
    E.mapLeft(() => ({ message: 'Date of birth is invalid or is not provided!' }))
  )

export const validateDateOfBirthLifted = liftValidation<CustomError, Date>(validateDateOfBirth)
