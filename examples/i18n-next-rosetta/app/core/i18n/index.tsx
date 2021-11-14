// Check: https://github.com/useflyyer/next-rosetta

export interface MyLocale {
  locale: string
  home: {
    logout: string
    userId: string
    userRole: string
    signUp: string
    login: string
    welcome: {
      part1: string
      part2: string
    }
    paragraph: {
      line1: string
      line2: string
    }
    code: string
    parenthesis: string
    restart: {
      part1: string
      part2: string
    }
    goto: string
    project: string
    documentationLink: string
    githubLink: string
    discordLink: string
    footer: string
  }
  loginPage: {
    login: string
    credentialError: string
    unexpectedError: string
    forgotPassword: string
    signUp: string
    email: string
    password: string
    or: string
  }
}
