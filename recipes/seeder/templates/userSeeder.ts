import faker from "faker"
import {seeder} from "./seeder"

export const userSeeder = seeder("user", () => {
  return {
    data: {
      email: faker.internet.exampleEmail(),
    },
  }
})
