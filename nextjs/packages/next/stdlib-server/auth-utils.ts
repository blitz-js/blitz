import * as crypto from 'crypto'
import { nanoid } from 'next/dist/compiled/nanoid/index.cjs'
import { AuthenticationError } from '../stdlib/index'
import SecurePasswordLib from 'secure-password'

export const hash256 = (input: string = '') => {
  return crypto.createHash('sha256').update(input).digest('hex')
}

export const generateToken = (numberOfCharacters: number = 32) =>
  nanoid(numberOfCharacters)

const SP = () => new SecurePasswordLib()

export const SecurePassword = {
  ...SecurePasswordLib,
  async hash(password: string | null | undefined) {
    if (!password) {
      throw new AuthenticationError()
    }
    const hashedBuffer = await SP().hash(Buffer.from(password))
    return hashedBuffer.toString('base64')
  },
  async verify(
    hashedPassword: string | null | undefined,
    password: string | null | undefined
  ) {
    if (!hashedPassword || !password) {
      throw new AuthenticationError()
    }
    try {
      const result = await SP().verify(
        Buffer.from(password),
        Buffer.from(hashedPassword, 'base64')
      )
      // Return result for valid results.
      switch (result) {
        case SecurePassword.VALID:
        case SecurePassword.VALID_NEEDS_REHASH:
          return result
        default:
          // For everything else throw AuthenticationError
          throw new AuthenticationError()
      }
    } catch (error) {
      // Could be error like failed to hash password
      throw new AuthenticationError()
    }
  },
}
