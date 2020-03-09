import {
  applicativeValidation,
  decodeString,
  isPropertyProvided,
  liftValidation,
  validate,
} from 'api/users/validation/helpers'
import { sequenceT } from 'fp-ts/lib/Apply'
import * as E from 'fp-ts/lib/Either'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from 'io-ts'
import { withMessage } from 'io-ts-types/lib/withMessage'
import { CustomError } from 'utils'
import isLength from 'validator/lib/isLength'

const oneCapitalLetter = (s: string): boolean => /[A-Z]/g.test(s)

type LengthValidatorOptions = Readonly<{ min?: number, max?: number }>

const length = ({ min, max }: LengthValidatorOptions) => (s: string): boolean => isLength(s, { min, max })

type NameBrand = {
  readonly Name: unique symbol,
}

const Name = t.brand(
  t.string,
  (s: string): s is t.Branded<string, NameBrand> => oneCapitalLetter(s) && length({ min: 3 })(s),
  'Name',
)

export enum NameErrorMessage {
  NotProvided = 'User name is not provided!',
  IncorrectType = 'User name is not of type string!',
  OneCapitalLetterValidation = 'User name must contain at least one capital letter!',
  LengthValidation = 'User name must be at least 3 characters long!',
}

export const NameGuard = withMessage(Name, () => NameErrorMessage.OneCapitalLetterValidation + ' ' + NameErrorMessage.LengthValidation)

export const isNameProvided = isPropertyProvided(NameErrorMessage.NotProvided)

export const decodeName = decodeString(NameErrorMessage.IncorrectType)

const oneCapitalLetterValidator = validate<string>(NameErrorMessage.OneCapitalLetterValidation)(oneCapitalLetter)

const lengthValidator = validate<string>(NameErrorMessage.LengthValidation)(length({ min: 3 }))

const toError = (errors: NEA.NonEmptyArray<CustomError>): CustomError => ({
  message: NEA.map((error: CustomError) => error.message as string)(errors).join(' '),
})

export const validateName = (name: string): E.Either<CustomError, string> =>
  pipe(
    sequenceT(applicativeValidation)(
      liftValidation(oneCapitalLetterValidator)(name),
      liftValidation(lengthValidator)(name),
    ),
    E.map(() => name),
    E.mapLeft(toError),
  )
