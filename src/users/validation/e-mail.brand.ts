import { pipe } from 'fp-ts/lib/pipeable'
import * as t from 'io-ts'
import * as E from 'fp-ts/lib/Either'
import { liftValidation } from 'users/validation/helpers'
import { CustomError } from 'utils'
import isEmailValidator from 'validator/lib/isEmail'

type EmailBrand = {
  readonly Email: unique symbol,
}

export const Email = t.brand(
  t.string,
  (s: string): s is t.Branded<string, EmailBrand> => isEmailValidator(s),
  'Email',
)

export type Email = t.TypeOf<typeof Email>

export const validateEmail = (email: unknown): E.Either<CustomError, string> => pipe(
  Email.decode(email),
  E.mapLeft(() => ({ message: 'E-mail is invalid or is not provided!' })),
)

export const validateEmailLifted = liftValidation<CustomError, string>(validateEmail)
