import type { MyLocale } from "."

export const table: MyLocale = {
  locale: "English",
  home: {
    logout: "Logout",
    userId: "User Id",
    userRole: "User Role",
    signUp: "Sign Up",
    login: "Login",
    welcome: {
      part1: "Congrats!",
      part2: " Your app is ready, including user sign-up and log-in.",
    },
    paragraph: {
      line1: "To add a new model to your app,",
      line2: "run the following in your terminal:",
    },
    code: "blitz generate all project name:string",
    parenthesis: "(And select Yes to run prisma migrate)",
    restart: {
      part1: "Then ",
      part2: "restart the server",
    },
    goto: "and go to",
    project: "/projects",
    documentationLink: "Documentation",
    githubLink: "Github Repo",
    discordLink: "Discord Community",
    footer: "Powered by Blitz.js",
  },
  loginPage: {
    login: "Login",
    credentialError: "Sorry, those credentials are invalid",
    unexpectedError: "Sorry, we had an unexpected error. Please try again. - {{message}}",
    forgotPassword: "Forgot your password?",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    or: "Or",
  },
}
