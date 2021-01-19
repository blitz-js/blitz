import * as z from "zod"

const password = z.string().min(10).max(100)

export const SignupInput = z.object({
  email: z.string().email(),
  password,
})
export type SignupInputType = z.infer<typeof SignupInput>

export const LoginInput = z.object({
  email: z.string().email(),
  password: z.string(),
})
export type LoginInputType = z.infer<typeof LoginInput>

export const ChangePasswordInput = z.object({
  currentPassword: z.string(),
  newPassword: password,
})
export type ChangePasswordInputType = z.infer<typeof ChangePasswordInput>
