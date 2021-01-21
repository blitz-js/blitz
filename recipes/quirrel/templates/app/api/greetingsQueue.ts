import { Queue } from "quirrel/blitz"

export interface Greetings {
  to: string;
  message: string;
}

export default Queue(
  "api/greetingsQueue", // the path of this API route
  async ({ to, message }: Greetings) => {
    console.log(`Greetings, ${to}! Thy ears shall hear: "${message}"`)
  }
)
