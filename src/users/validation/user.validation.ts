import { sequenceT } from 'fp-ts/lib/Apply'
import * as A from 'fp-ts/lib/Array'
import * as E from 'fp-ts/lib/Either'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString'
import { withMessage } from 'io-ts-types/lib/withMessage'
import { CustomError } from 'utils'

export const UserValidationSchema = t.type({
  name: withMessage(t.string, () => 'Invalid user name!'),
  email: withMessage(t.string, () => 'Invalid e-mail!'),
  dateOfBirth: withMessage(DateFromISOString, () => 'Invalid date of birth!'),
})

export type User = t.TypeOf<typeof UserValidationSchema>

const applicativeValidation = E.getValidation(NEA.getSemigroup<CustomError>())

const liftValidation = <Error, A>(validate: (v: A) => E.Either<Error, A>): (a: A) => E.Either<NEA.NonEmptyArray<Error>, A> => (a: A) => pipe(
  validate(a),
  E.mapLeft((error: Error) => [error]),
)

const oneCapitalLetter = (message: string) => (firstName: string): E.Either<CustomError, string> => /[A-Z]/g.test(firstName)
  ? E.right(firstName)
  : E.left<CustomError>({ message })

const isEmail = (message: string) => (email: string): E.Either<CustomError, string> => email.includes('@')
  ? E.right(email)
  : E.left<CustomError>({ message })

const oneCapitalLetterValidation = (message: string) => liftValidation<CustomError, string>(oneCapitalLetter(message))

const emailValidation = (message: string) => liftValidation<CustomError, string>(isEmail(message))

const validateFirstName = (name: string): E.Either<NEA.NonEmptyArray<CustomError>, string> => pipe(
  sequenceT(applicativeValidation)(
    // using sequenceT in case if more validation rules will come up...
    oneCapitalLetterValidation('One capital letter must be used in user name!')(name),
  ),
  E.map(() => name),
)

const validateEmail = (email: string): E.Either<NEA.NonEmptyArray<CustomError>, string> => pipe(
  sequenceT(applicativeValidation)(
    // using sequenceT in case if more validation rules will come up...
    emailValidation('Provided e-mail is invalid!')(email),
  ),
  E.map(() => email),
)

const toValidationError = (errors: t.Errors): CustomError => ({
  message: A.map(({ message }: t.ValidationError) => message)(errors).join(' '),
})

const validateUserSchema = (data: unknown): E.Either<CustomError, User> => pipe(
  UserValidationSchema.decode(data),
  E.mapLeft(toValidationError),
)

const toUser = ([name, email, dateOfBirth]: [string, string, Date]): User => ({
  name,
  email,
  dateOfBirth,
})

const toFieldsValidationError = (errors: NEA.NonEmptyArray<CustomError>): CustomError => ({
  message: NEA.map((e: CustomError) => e.message)(errors).join(' '),
})

const validateUserFields = ({ name, email, dateOfBirth }: User): E.Either<CustomError, User> => pipe(
  sequenceT(applicativeValidation)(
    validateFirstName(name),
    validateEmail(email),
  ),
  E.map<[string, string], User>(([name, email]) => toUser([name, email, dateOfBirth])),
  E.mapLeft(toFieldsValidationError),
)

export const validateUser = (data: unknown): E.Either<CustomError, User> => pipe(
  validateUserSchema(data),
  E.chain(validateUserFields),
)
