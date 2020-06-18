// eslint-disable-next-line
export const storage = async (key: string) => {
  const value = localStorage.getItem(key)

  if (!value) return undefined

  return JSON.parse(value)
}
