import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from 'io-ts'
import { liftValidation } from 'users/validation/helpers'
import { CustomError } from 'utils'
import lengthValidator from 'validator/lib/isLength'

type NameBrand = {
  readonly Name: unique symbol,
}

const oneCapitalLetter = (s: string): boolean => /[A-Z]/g.test(s)

type LengthValidatorOptions = Readonly<{ min?: number, max?: number }>

const length = (s: string) => ({ min, max }: LengthValidatorOptions): boolean => lengthValidator(s, { min, max })

export const Name = t.brand(
  t.string,
  (s: string): s is t.Branded<string, NameBrand> => oneCapitalLetter(s) && length(s)({ min: 3 }),
  'Name',
)

export type Name = t.TypeOf<typeof Name>

export const validateName = (name: unknown): E.Either<CustomError, string> =>
  pipe(
    Name.decode(name),
    E.mapLeft(() => ({
      message: 'User name is invalid or is not provided! User name must contain at least one capital letter and be at least 3 characters long!',
    }))
  )

export const validateNameLifted = liftValidation<CustomError, string>(validateName)
