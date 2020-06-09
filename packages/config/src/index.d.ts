declare module NodeJS {
  interface Global {
    config: Record<string, unknown>
  }
}
