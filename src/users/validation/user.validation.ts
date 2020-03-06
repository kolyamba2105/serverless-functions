import { sequenceT } from 'fp-ts/lib/Apply'
import * as E from 'fp-ts/lib/Either'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString'
import { validateDateOfBirthLifted } from 'users/validation/date-of-birth.brand'
import { validateEmailLifted } from 'users/validation/e-mail.brand'
import { applicativeValidation } from 'users/validation/helpers'
import { validateNameLifted } from 'users/validation/name.brand'
import { CustomError } from 'utils'

const User = t.type({
  name: t.string,
  email: t.string,
  dateOfBirth: DateFromISOString,
})

export type User = t.TypeOf<typeof User>

const toUser = ([name, email, dateOfBirth]: [string, string, Date]): User => ({
  name,
  email,
  dateOfBirth,
})

const toFieldsValidationError = (errors: NEA.NonEmptyArray<CustomError>): CustomError => ({
  message: NEA.map((e: CustomError) => e.message)(errors).join(' '),
})

// TODO better error reporter
export const validateUser = ({ name, email, dateOfBirth }: any): E.Either<CustomError, User> => pipe(
  sequenceT(applicativeValidation)(
    validateNameLifted(name),
    validateEmailLifted(email),
    validateDateOfBirthLifted(dateOfBirth),
  ),
  E.map(toUser),
  E.mapLeft(toFieldsValidationError),
)
