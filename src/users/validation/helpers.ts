import * as E from 'fp-ts/lib/Either'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import { pipe } from 'fp-ts/lib/pipeable'
import { CustomError } from 'utils'

export const applicativeValidation = E.getValidation(NEA.getSemigroup<CustomError>())

export const liftValidation = <Error, A>(validate: (v: A) => E.Either<Error, A>): (a: A) => E.Either<NEA.NonEmptyArray<Error>, A> =>
  (a: A) => pipe(
    validate(a),
    E.mapLeft((error: Error) => [error]),
  )
