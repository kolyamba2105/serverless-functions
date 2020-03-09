import { decodeDate, isPropertyProvided, validate } from 'api/users/validation/helpers'
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString'
import { withMessage } from 'io-ts-types/lib/withMessage'

enum DateOfBirthErrorMessage {
  NotProvided = 'Date of birth is not provided!',
  IncorrectType = 'Date of birth cannot be parsed to type Date!',
  NotValid = 'Date of birth must be earlier than 1970!',
}

export const DateOfBirthGuard = withMessage(DateFromISOString, () => DateOfBirthErrorMessage.IncorrectType)

export const isDateOfBirthProvided = isPropertyProvided(DateOfBirthErrorMessage.NotProvided)

export const decodeDateOfBirth = decodeDate(DateOfBirthErrorMessage.IncorrectType)

const dateOfBirthValidator = (date: Date): boolean => date.getFullYear() > 1970

export const validateDateOfBirth = validate<Date>(DateOfBirthErrorMessage.NotValid)(dateOfBirthValidator)
