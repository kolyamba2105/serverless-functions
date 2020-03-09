import { liftValidation } from 'api/users/validation/helpers'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from 'io-ts'
import { CustomError } from 'utils'
import isEmail from 'validator/lib/isEmail'

type EmailBrand = {
  readonly Email: unique symbol,
}

export const Email = t.brand(
  t.string,
  (s: string): s is t.Branded<string, EmailBrand> => isEmail(s),
  'Email',
)

export type Email = t.TypeOf<typeof Email>

const emailValidator = (s: string): E.Either<CustomError, string> => isEmail(s)
  ? E.right(s)
  : E.left({ message: 'E-mail is not valid!' })

export const validateEmail = (email: string): E.Either<CustomError, string> =>
  pipe(
    emailValidator(email),
    E.mapLeft(() => ({ message: 'E-mail is invalid or is not provided!' })),
  )

export const validateEmailLifted = liftValidation<CustomError, string>(validateEmail)
