import { applicativeValidation, liftValidation, toValidationError } from 'api/users/validation/helpers'
import { sequenceT } from 'fp-ts/lib/Apply'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from 'io-ts'
import { CustomError } from 'utils'
import isLength from 'validator/lib/isLength'

type NameBrand = {
  readonly Name: unique symbol,
}

const oneCapitalLetter = (s: string): boolean => /[A-Z]/g.test(s)

type LengthValidatorOptions = Readonly<{ min?: number, max?: number }>

const length = (s: string) => ({ min, max }: LengthValidatorOptions): boolean => isLength(s, { min, max })

export const Name = t.brand(
  t.string,
  (s: string): s is t.Branded<string, NameBrand> => oneCapitalLetter(s) && length(s)({ min: 3 }),
  'Name',
)

export type Name = t.TypeOf<typeof Name>

const oneCapitalLetterValidator = (s: string): E.Either<CustomError, string> => oneCapitalLetter(s)
  ? E.right(s)
  : E.left({ message: 'User name must contain at least one capital letter!' })

const lengthValidator = (s: string): E.Either<CustomError, string> => length(s)({ min: 3 })
  ? E.right(s)
  : E.left({ message: 'User name must be at least 3 characters long!' })

export const validateName = (name: string): E.Either<CustomError, string> =>
  pipe(
    sequenceT(applicativeValidation)(
      liftValidation(lengthValidator)(name),
      liftValidation(oneCapitalLetterValidator)(name),
    ),
    E.map(() => name),
    E.mapLeft(toValidationError),
  )

export const validateNameLifted = liftValidation<CustomError, string>(validateName)
