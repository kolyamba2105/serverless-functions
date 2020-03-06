import * as E from 'fp-ts/lib/Either'
import { readFileSync } from 'fs'
import { join } from 'path'
import { CustomError } from 'utils'
import { DateOfBirth, validateDateOfBirth } from './date-of-birth.brand'
import { validateEmail } from './e-mail.brand'
import { validateName } from './name.brand'
import { User, validateUser } from './user.validation'

describe('User DTO validation', () => {
  describe('Email brand type', () => {
    it('should properly decode an e-mail', () => {
      const email: string = 'foo@bar.com'
      const validationResult: E.Either<CustomError, string> = validateEmail(email)

      expect(E.isRight(validationResult)).toBeTruthy()
    })

    it('should not decode an invalid e-mail', () => {
      const email: string = 'bla-bla-bla'
      const validationResult: E.Either<CustomError, string> = validateEmail(email)

      expect(E.isLeft(validationResult)).toBeTruthy()
    })
  })

  describe('Name brand type', () => {
    it('should properly decode user name', () => {
      const name: string = 'Foo'
      const validationResult: E.Either<CustomError, string> = validateName(name)

      expect(E.isRight(validationResult)).toBeTruthy()
    })

    it('should not decode user name when it does not contain at least one capital letter', () => {
      const name: string = 'mike'
      const validationResult: E.Either<CustomError, string> = validateName(name)

      expect(E.isLeft(validationResult)).toBeTruthy()
    })

    it('should not decode user name when it is shorter then 3 chars', () => {
      const name: string = 'CJ'
      const validationResult: E.Either<CustomError, string> = validateName(name)

      expect(E.isLeft(validationResult)).toBeTruthy()
    })
  })

  describe('DateOfBirth brand type', () => {
    it('should properly decode date of birth', () => {
      const dateOfBirth: string = '1998-04-04'
      const validationResult: E.Either<CustomError, DateOfBirth> = validateDateOfBirth(dateOfBirth)

      expect(E.isRight(validationResult)).toBeTruthy()
    })

    it('should properly decode date of birth when it is a proper ISOString', () => {
      const dateOfBirth: string = '1998-04-04T00:00:00.000Z'
      const validationResult: E.Either<CustomError, DateOfBirth> = validateDateOfBirth(dateOfBirth)

      expect(E.isRight(validationResult)).toBeTruthy()
    })

    it('should not decode date of birth when it is a random string', () => {
      const dateOfBirth: string = 'bla-bla-bla'
      const validationResult: E.Either<CustomError, DateOfBirth> = validateDateOfBirth(dateOfBirth)

      expect(E.isLeft(validationResult)).toBeTruthy()
    })

    it('should not decode date of birth when it is a number', () => {
      const dateOfBirth: number = 2000
      const validationResult: E.Either<CustomError, DateOfBirth> = validateDateOfBirth(dateOfBirth)

      expect(E.isLeft(validationResult)).toBeTruthy()
    })
  })

  describe('User DTO validation', () => {
    const [
      correctUser,
      userWithIncorrectDate,
      userWithMissingProperty,
    ] = JSON.parse(readFileSync(join(__dirname, 'users.json')).toString())

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
  })
})
