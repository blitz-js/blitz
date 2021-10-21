import { PromiseReturnType } from "next/types/utils"
import signup from "app/auth/mutations/signup"
import Chance from "chance"

const chance = new Chance()

const ctx = {
  session: { $create: () => {} },
}

type UserAttributes = {
  email?: string
  password: string
}

export const user = async ({ email = chance.email(), password }: UserAttributes) => {
  const user = await signup({ email, password }, ctx as any)

  return user
}

export type User = PromiseReturnType<typeof user>
