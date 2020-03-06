import * as E from 'fp-ts/lib/Either'
import { readFileSync } from 'fs'
import * as t from 'io-ts'
import { join } from 'path'
import { User, UserValidationSchema } from './user.validation'

const [
  correctUser,
  correctUserWithISODateString,
  userWithInvalidDateOfBirth,
  userWithNumberInsteadOfDate,
  userWithStringInsteadOfDate,
  userWithoutEmail,
] = JSON.parse(readFileSync(join(__dirname, 'users.json')).toString())

describe('User DTO validation', () => {
  it('should properly decode user from JSON', () => {
    const expectedUser: User = {
      name: 'Foo',
      email: 'foo@mail.com',
      dateOfBirth: new Date('1998-04-04'),
    }
    const validation: E.Either<t.Errors, User> = UserValidationSchema.decode(correctUser)

    expect(validation).toStrictEqual(E.right(expectedUser))
  })

  it('should properly decode user from JSON with DateISOString as date of birth', () => {
    const validation: E.Either<t.Errors, User> = UserValidationSchema.decode(correctUserWithISODateString)

    expect(E.isRight(validation)).toBeTruthy()
  })

  it('should not decode user from JSON with invalid date format', () => {
    const validation: E.Either<t.Errors, User> = UserValidationSchema.decode(userWithInvalidDateOfBirth)

    expect(E.isLeft(validation)).toBeTruthy()
  })

  it('should not decode user from JSON when user has NUMBER as a date of birth', () => {
    const validation: E.Either<t.Errors, User> = UserValidationSchema.decode(userWithNumberInsteadOfDate)

    expect(E.isLeft(validation)).toBeTruthy()
  })

  it('should not decode user from JSON when user has STRING as a date of birth', () => {
    const validation: E.Either<t.Errors, User> = UserValidationSchema.decode(userWithStringInsteadOfDate)

    expect(E.isLeft(validation)).toBeTruthy()
  })

  it('should not decode user from JSON when user is missing some properties', () => {
    const validation: E.Either<t.Errors, User> = UserValidationSchema.decode(userWithoutEmail)

    expect(E.isLeft(validation)).toBeTruthy()
  })
})
