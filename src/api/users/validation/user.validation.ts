import { DateOfBirth } from 'api/users/validation/date-of-birth.brand'
import { Email, validateEmailLifted } from 'api/users/validation/e-mail.brand'
import { applicativeValidation, toDecodeValidationError, toValidationError } from 'api/users/validation/helpers'
import { Name, validateNameLifted } from 'api/users/validation/name.brand'
import { sequenceT } from 'fp-ts/lib/Apply'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString'
import { withMessage } from 'io-ts-types/lib/withMessage'
import { CustomError } from 'utils'

const User = t.type({
  name: withMessage(t.string, () => 'User name is not provided or is not of type string!'),
  email: withMessage(t.string, () => 'User e-mail is not provided or is not of type string!'),
  dateOfBirth: withMessage(DateFromISOString, () => 'User date of birth is not provided or cannot be parsed to type Date!'),
})

export type User = t.TypeOf<typeof User>

const UserPayload = t.exact(t.partial({
  name: withMessage(Name, () => 'User name is not valid or is not provided!'),
  email: withMessage(Email, () => 'User e-mail is not valid or is not provided!'),
  dateOfBirth: withMessage(DateOfBirth, () => 'User date of birth is not valid or is not provided!'),
}))

export type UserPayload = t.TypeOf<typeof UserPayload>

const toUser = ([name, email, dateOfBirth]: [string, string, Date]): User => ({
  name,
  email,
  dateOfBirth,
})

const validateUserFields = ({ name, email, dateOfBirth }: User): E.Either<CustomError, User> =>
  pipe(
    sequenceT(applicativeValidation)(
      validateNameLifted(name),
      validateEmailLifted(email),
    ),
    E.map(([name, email]: [string, string]) => toUser([name, email, dateOfBirth])),
    E.mapLeft(toValidationError),
  )

export const validateUser = (user: unknown): E.Either<CustomError, User> =>
  pipe(
    User.decode(user),
    E.mapLeft(toDecodeValidationError),
    E.chain(validateUserFields),
  )

export const validateUserPayload = (userPayload: unknown): E.Either<CustomError, UserPayload> =>
  pipe(
    UserPayload.decode(userPayload),
    E.mapLeft(toDecodeValidationError),
  )
