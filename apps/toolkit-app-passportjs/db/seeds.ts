import db from "./index"

/*
 * This seed function is executed when you run `blitz db seed`.
 *
 * Probably you want to use a library like https://chancejs.com
 * to easily generate realistic data.
 */
const seed = async () => {
  await db.$reset()

  for (let i = 0; i < 1; i++) {
    await db.user.create({
      data: {
        email: "test@test.com",
      },
    })
  }
}

export default seed
