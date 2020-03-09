import { decodeString, isPropertyProvided, validate } from 'api/users/validation/helpers'
import * as t from 'io-ts'
import { withMessage } from 'io-ts-types/lib/withMessage'
import isEmail from 'validator/lib/isEmail'

type EmailBrand = {
  readonly Email: unique symbol,
}

const Email = t.brand(
  t.string,
  (s: string): s is t.Branded<string, EmailBrand> => isEmail(s),
  'Email',
)

enum EmailErrorMessage {
  NotProvided = 'E-mail is not provided!',
  IncorrectType = 'E-mail is not of type string!',
  NotValid = 'E-mail is not valid',
}

export const EmailGuard = withMessage(Email, () => EmailErrorMessage.NotValid)

export const isEmailProvided = isPropertyProvided(EmailErrorMessage.NotProvided)

export const decodeEmail = decodeString(EmailErrorMessage.IncorrectType)

// TODO async validation for existence of provided email in DB
export const validateEmail = validate<string>(EmailErrorMessage.NotValid)(isEmail)
