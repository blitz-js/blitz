require("@testing-library/jest-dom")

jest.setTimeout(10000)

afterAll(async () => {
  try {
    await global._blitz_prismaClient.$disconnect()
    // console.log("DISCONNECT")
    // await new Promise((resolve) => setTimeout(resolve, 500))
  } catch (error) {
    // ignore error
  }
})
