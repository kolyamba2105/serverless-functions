import * as A from 'fp-ts/lib/Array'
import * as E from 'fp-ts/lib/Either'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from 'io-ts'
import { CustomError } from 'utils'

export const applicativeValidation = E.getValidation(NEA.getSemigroup<CustomError>())

export const liftValidation = <Error, A>(validate: (v: A) => E.Either<Error, A>) => (a: A): E.Either<NEA.NonEmptyArray<Error>, A> =>
  pipe(
    validate(a),
    E.mapLeft((error: Error) => [error]),
  )

// Maybe helpful in future...
// const decode = <I>(decodeFn: (i: unknown) => t.Validation<I>) => (message: string) => (input: unknown): E.Either<CustomError, I> =>
//   pipe(
//     decodeFn(input),
//     E.mapLeft(() => ({ message })),
//   )

export const toValidationError = (errors: NEA.NonEmptyArray<CustomError>): CustomError => ({
  message: NEA.map((e: CustomError) => (e.message as string))(errors),
})

export const toDecodeValidationError = (errors: t.Errors): CustomError => ({
  message: A.map((error: t.ValidationError) => error.message)(errors),
})
