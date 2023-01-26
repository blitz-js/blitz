import * as crypto from "crypto"
import {nanoid} from "nanoid"

export const hash256 = (input: string = "") => {
  return crypto.createHash("sha256").update(input).digest("hex")
}

export const generateToken = (numberOfCharacters: number = 32) => nanoid(numberOfCharacters)
