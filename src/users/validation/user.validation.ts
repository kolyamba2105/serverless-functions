import { sequenceT } from 'fp-ts/lib/Apply'
import * as A from 'fp-ts/lib/Array'
import * as E from 'fp-ts/lib/Either'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString'
import { withMessage } from 'io-ts-types/lib/withMessage'
import { DateOfBirth, validateDateOfBirthLifted } from 'users/validation/date-of-birth.brand'
import { Email, validateEmailLifted } from 'users/validation/e-mail.brand'
import { applicativeValidation } from 'users/validation/helpers'
import { Name, validateNameLifted } from 'users/validation/name.brand'
import { CustomError } from 'utils'

const User = t.type({
  name: t.string,
  email: t.string,
  dateOfBirth: DateFromISOString,
})

export type User = t.TypeOf<typeof User>

const UserPayload = t.partial({
  name: withMessage(Name, () => 'Invalid user name! User name must contain at least one capital letter and be at least 3 characters long!'),
  email: withMessage(Email, () => 'Invalid e-mail!'),
  dateOfBirth: withMessage(DateOfBirth, () => 'Date of birth is invalid or is not provided!'),
})

const ExactUserPayload = t.exact(UserPayload)

export type ExactUserPayload = t.TypeOf<typeof ExactUserPayload>

const toUser = ([name, email, dateOfBirth]: [string, string, Date]): User => ({
  name,
  email,
  dateOfBirth,
})

const toValidationError = (errors: NEA.NonEmptyArray<CustomError>): CustomError => ({
  message: NEA.map((e: CustomError) => (e.message as string))(errors),
})

export const validateUser = ({ name, email, dateOfBirth }: any): E.Either<CustomError, User> => pipe(
  sequenceT(applicativeValidation)(
    validateNameLifted(name),
    validateEmailLifted(email),
    validateDateOfBirthLifted(dateOfBirth),
  ),
  E.map(toUser),
  E.mapLeft(toValidationError),
)

const toPayloadValidationError = (errors: t.Errors): CustomError => ({
  message: A.map((error: t.ValidationError) => error.message)(errors),
})

export const validateUserPayload = (userPayload: unknown): E.Either<CustomError, ExactUserPayload> => pipe(
  ExactUserPayload.decode(userPayload),
  E.mapLeft(toPayloadValidationError),
)
