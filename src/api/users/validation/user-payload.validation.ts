import { DateOfBirthGuard } from 'api/users/validation/date-of-birth.validation'
import { EmailGuard } from 'api/users/validation/e-mail.validation'
import { NameGuard } from 'api/users/validation/name.validation'
import * as A from 'fp-ts/lib/Array'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from 'io-ts'
import { CustomError } from 'utils'

const UserPayload = t.exact(t.partial({
  name: NameGuard,
  email: EmailGuard,
  dateOfBirth: DateOfBirthGuard,
}))

export type UserPayload = t.TypeOf<typeof UserPayload>

export const toDecodeValidationError = (errors: t.Errors): CustomError => ({
  message: A.map((error: t.ValidationError) => error.message)(errors),
})

export const validateUserPayload = (userPayload): E.Either<CustomError, UserPayload> =>
  pipe(
    UserPayload.decode(userPayload),
    E.mapLeft(toDecodeValidationError),
  )
