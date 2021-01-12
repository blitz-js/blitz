export const createRandomUser = () => {
  const random = Math.round(Math.random() * 100000).toString()
  const email = `test_${random}@example.com`
  const password = `password_${random}`

  return { email, password }
}
