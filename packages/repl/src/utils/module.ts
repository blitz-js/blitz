const invalidateCache = (module: string) => {
  delete require.cache[require.resolve(module)]
}

export const forceRequire = (module: string) => {
  invalidateCache(module)
  return require(module)
}
