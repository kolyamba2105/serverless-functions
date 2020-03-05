import { sequenceT } from 'fp-ts/lib/Apply'
import * as E from 'fp-ts/lib/Either'
import * as A from 'fp-ts/lib/NonEmptyArray'
import { pipe } from 'fp-ts/lib/pipeable'
import { UserDto } from 'users/user.model'
import { CustomError } from 'utils'

const applicativeValidation = E.getValidation(A.getSemigroup<CustomError>())

const liftValidation = <Error, A>(validate: (v: A) => E.Either<Error, A>): (a: A) => E.Either<A.NonEmptyArray<Error>, A> => (a: A) => pipe(
  validate(a),
  E.mapLeft((error: Error) => [error]),
)

const isRequired = <T>(message: string) => (v: T): E.Either<CustomError, T> => pipe(
  v,
  E.fromNullable<CustomError>({ message }),
)

const oneCapitalLetter = (message: string) => (firstName: string): E.Either<CustomError, string> => /[A-Z]/g.test(firstName)
  ? E.right(firstName)
  : E.left<CustomError>({ message })

const isEmail = (email: string): E.Either<CustomError, string> => email.includes('@')
  ? E.right(email)
  : E.left<CustomError>({ message: 'E-mail is invalid!' })

const requiredValidation = <T>(message: string) => liftValidation<CustomError, T>(isRequired<T>(message))

const oneCapitalLetterValidation = (message: string) => liftValidation<CustomError, string>(oneCapitalLetter(message))

const emailValidation = liftValidation<CustomError, string>(isEmail)

export const validateFirstName = (name: string): E.Either<A.NonEmptyArray<CustomError>, string> => pipe(
  sequenceT(applicativeValidation)(
    requiredValidation('Name is required!')(name),
    oneCapitalLetterValidation('At least one capital letter must be used in name!')(name),
  ),
  E.map(() => name),
)

export const validateEmail = (email: string): E.Either<A.NonEmptyArray<CustomError>, string> => pipe(
  sequenceT(applicativeValidation)(
    requiredValidation<string>('E-mail is required!')(email),
    emailValidation(email),
  ),
  E.map(() => email),
)

export const validateDateOfBirth = (date: Date): E.Either<A.NonEmptyArray<CustomError>, Date> => pipe(
  sequenceT(applicativeValidation)(
    requiredValidation<Date>('Date of birth is required!')(date),
  ),
  E.map(() => date),
)

const toUserDto = ([name, email, dateOfBirth]: [string, string, Date]): UserDto => ({
  name,
  email,
  dateOfBirth,
})

const toError = (errors: A.NonEmptyArray<CustomError>): CustomError => ({
  message: A.map((e: CustomError) => e.message)(errors).join(' '),
})

const isUserDto = (data: unknown): E.Either<A.NonEmptyArray<CustomError>, UserDto> => typeof data === 'object' && 'name' in data && 'email' in data && 'dateOfBirth' in data
  ? E.right(data as UserDto)
  : E.left([{ message: 'Invalid data format!' }])

export const validateUser = (data: unknown): E.Either<CustomError, UserDto> => pipe(
  isUserDto(data),
  E.chain((data: UserDto) => sequenceT(applicativeValidation)(
    validateFirstName(data.name),
    validateEmail(data.email),
    validateDateOfBirth(data.dateOfBirth),
  )),
  E.map(toUserDto),
  E.mapLeft(toError),
)
