import * as E from 'fp-ts/lib/Either'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString'
import { CustomError } from 'utils'

export const applicativeValidation = E.getValidation(NEA.getSemigroup<CustomError>())

export const liftValidation = <Error, A>(validate: (v: A) => E.Either<Error, A>) => (a: A): E.Either<NEA.NonEmptyArray<Error>, A> =>
  pipe(
    validate(a),
    E.mapLeft((error: Error) => [error]),
  )

export const liftDecode = <Error, I, O>(validate: (v: I) => E.Either<Error, O>) => (a: I): E.Either<NEA.NonEmptyArray<Error>, O> =>
  pipe(
    validate(a),
    E.mapLeft((error: Error) => [error]),
  )

export const decode = <I>(decodeFn: (i: unknown) => t.Validation<I>) => (message: string) => (input: unknown): E.Either<CustomError, I> =>
  pipe(
    decodeFn(input),
    E.mapLeft(() => ({ message })),
  )

export const decodeString = decode<string>(t.string.decode)

export const decodeDate = decode<Date>(DateFromISOString.decode)

export const isPropertyProvided = (message: string) => (property: unknown): E.Either<CustomError, unknown> => E.fromNullable({ message })(property)

export const validate = <I>(message: string) => (validatorFn: (input: I) => boolean) => (input: I): E.Either<CustomError, I> =>
  validatorFn(input)
    ? E.right(input)
    : E.left({ message })
