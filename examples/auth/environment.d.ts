declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AUTH0_DOMAIN: string
      AUTH0_CLIENT_ID: string
      AUTH0_CLIENT_SECRET: string
      GITHUB_CLIENT_ID: string
      GITHUB_CLIENT_SECRET: string
      TWITTER_CONSUMER_KEY: string
      TWITTER_CONSUMER_SECRET: string
    }
  }
}

export {}
