import {
  decodeDateOfBirth,
  isDateOfBirthProvided,
  validateDateOfBirth,
} from 'api/users/validation/date-of-birth.validation'
import { decodeEmail, isEmailProvided, validateEmail } from 'api/users/validation/e-mail.validation'
import { applicativeValidation, liftDecode, liftValidation } from 'api/users/validation/helpers'
import { decodeName, isNameProvided, validateName } from 'api/users/validation/name.validation'
import { sequenceT } from 'fp-ts/lib/Apply'
import * as E from 'fp-ts/lib/Either'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString'
import { CustomError } from 'utils'

const User = t.type({
  name: t.string,
  email: t.string,
  dateOfBirth: DateFromISOString,
})

export type User = t.TypeOf<typeof User>

const checkIfPropertiesAreProvided = (data): E.Either<NEA.NonEmptyArray<CustomError>, [unknown, unknown, unknown]> =>
  sequenceT(applicativeValidation)(
    liftValidation(isNameProvided)(data.name),
    liftValidation(isEmailProvided)(data.email),
    liftValidation(isDateOfBirthProvided)(data.dateOfBirth),
  )

const decodeProperties = ([name, email, dateOfBirth]): E.Either<NEA.NonEmptyArray<CustomError>, [string, string, Date]> =>
  sequenceT(applicativeValidation)(
    liftDecode(decodeName)(name),
    liftDecode(decodeEmail)(email),
    liftDecode(decodeDateOfBirth)(dateOfBirth),
  )

const validateUserProperties = ([name, email, dateOfBirth]): E.Either<NEA.NonEmptyArray<CustomError>, [string, string, Date]> =>
  sequenceT(applicativeValidation)(
    liftValidation(validateName)(name),
    liftValidation(validateEmail)(email),
    liftValidation(validateDateOfBirth)(dateOfBirth),
  )

const toUser = ([name, email, dateOfBirth]: [string, string, Date]): User => ({
  name,
  email,
  dateOfBirth,
})

const toValidationError = (errors: NEA.NonEmptyArray<CustomError>): CustomError => ({
  message: NEA.map((e: CustomError) => (e.message as string))(errors),
})

export const validateUser = (data): E.Either<CustomError, User> =>
  pipe(
    checkIfPropertiesAreProvided(data),
    E.chain(decodeProperties),
    E.chain(validateUserProperties),
    E.map(toUser),
    E.mapLeft(toValidationError),
  )
