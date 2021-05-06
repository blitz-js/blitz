import * as z from "zod"

const emailRequired = "Email is required!"
const passwordRequired = "Password is required!"
const passwordMinLength = "Password must be more than or equal 10 character!"
const passwordMaxLength = "Password must less than or equal 100!"

const password = z
  .string()
  .nonempty({message: passwordRequired})
  .min(10, {message: passwordMinLength})
  .max(100, {message: passwordMaxLength})
const email = z.string().nonempty({message: emailRequired}).email()

export const Signup = z.object({
  email,
  password,
})

export const Login = z.object({
  email: z.string().nonempty({message: emailRequired}).email(),
  password: z.string().nonempty({message: passwordRequired}),
})

export const ForgotPassword = z.object({
  email,
})

export const ResetPassword = z
  .object({
    password,
    passwordConfirmation: password,
    token: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"], // set the path of the error
  })

export const ChangePassword = z.object({
  currentPassword: z.string().nonempty({message: passwordRequired}),
  newPassword: password,
})
