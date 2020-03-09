import { validateEmail } from 'api/users/validation/e-mail.validation'
import { UserPayload, validateUserPayload } from 'api/users/validation/user-payload.validation'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import { readFileSync } from 'fs'
import { identity } from 'io-ts'
import { join } from 'path'
import { CustomError } from 'utils/aws.lambda'
import { User, validateUser } from './user.validation'

const [
  correctUser,
  userWithIncorrectDate,
  userWithMissingProperty,
  userWithOddProperties,
  userPayloadWithInvalidDate,
  userPayloadWithInvalidProperties,
  userPayloadWithOddProperties,
] = JSON.parse(readFileSync(join(__dirname, 'users.json')).toString())

describe('User DTO validation', () => {
  describe('Email brand type', () => {
    it('should properly decode an e-mail', () => {
      const email = 'foo@bar.com'
      const validationResult: E.Either<CustomError, string> = validateEmail(email)

      expect(E.isRight(validationResult)).toBeTruthy()
    })

    it('should not decode an invalid e-mail', () => {
      const email = 'bla-bla-bla'
      const validationResult: E.Either<CustomError, string> = validateEmail(email)

      expect(E.isLeft(validationResult)).toBeTruthy()
    })
  })

  describe('User DTO validation', () => {
    it('should properly decode user from JSON', () => {
      const validationResult: E.Either<CustomError, User> = validateUser(correctUser)

      expect(E.isRight(validationResult)).toBeTruthy()
    })

    it('should not decode user from JSON when date of birth is number', () => {
      const validationResult: E.Either<CustomError, User> = validateUser(userWithIncorrectDate)

      expect(E.isLeft(validationResult)).toBeTruthy()
    })

    it('should not decode user from JSON when some props are missing', () => {
      const validationResult: E.Either<CustomError, User> = validateUser(userWithMissingProperty)

      expect(E.isLeft(validationResult)).toBeTruthy()
    })

    it('should only decode properties that are defined on user DTO', () => {
      const validationResult = pipe(
        validateUser(userWithOddProperties),
        E.fold(
          console.error,
          identity,
        )
      )
      const expectedResult = {
        name: 'Buzz',
        email: 'buzz@light.com',
        dateOfBirth: new Date('20010-01-12'),
      }

      expect(validationResult).toStrictEqual(expectedResult)
    })
  })

  describe('UserPayload validation', () => {
    it('should properly decode user payload', () => {
      const validationResult: E.Either<CustomError, UserPayload> = validateUserPayload(userWithMissingProperty)

      expect(E.isRight(validationResult)).toBeTruthy()
    })

    it('should not decode user payload when date of birth is invalid', () => {
      const validationResult: E.Either<CustomError, UserPayload> = validateUserPayload(userPayloadWithInvalidDate)

      expect(E.isLeft(validationResult)).toBeTruthy()
    })

    it('should ignore invalid properties on user payload', () => {
      const validationResult = pipe(
        validateUserPayload(userPayloadWithInvalidProperties),
        E.fold(
          console.error,
          identity,
        )
      )

      expect(validationResult).toStrictEqual({})
    })

    it('should only decode properties defined on user payload', () => {
      const validationResult = pipe(
        validateUserPayload(userPayloadWithOddProperties),
        E.fold(
          console.error,
          identity,
        )
      )
      const expectedResult = {
        name: 'Foo',
        dateOfBirth: new Date('1999-01-01'),
      }

      expect(validationResult).toStrictEqual(expectedResult)
    })
  })
})
