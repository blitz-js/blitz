import fetch from 'node-fetch'

export const fetchRetry = async (url: string, n: number) => {
  let error
  for (let i = 0; i < n; i++) {
    try {
      return await fetch(url)
    } catch (err) {
      error = err
    }
  }
  return error
}
