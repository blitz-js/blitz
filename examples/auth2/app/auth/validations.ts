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

export const UpdatePasswordInput = z.object({
  currentPassword: z.string(),
  newPassword: password,
})
export type UpdatePasswordInputType = z.infer<typeof UpdatePasswordInput>

export const ForgotPasswordInput = z.object({
  email: z.string().email(),
})
export type ForgotPasswordInputType = z.infer<typeof ForgotPasswordInput>

export const ResetPasswordInput = z
  .object({
    password: password,
    passwordConfirmation: password,
    token: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"], // set the path of the error
  })
export type ResetPasswordInputType = z.infer<typeof ResetPasswordInput>
