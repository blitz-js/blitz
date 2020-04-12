export const isRpcPathRegexString = '(?:app\\/).*(?:queries|mutations)\\/.+'
export function isRpcPath(filePath: string) {
  return new RegExp(isRpcPathRegexString).exec(filePath)
}
