import greetingsQueue from "app/api/greetingsQueue"

export default async function enqueueGreeting() {
  await greetingsQueue.enqueue({
    to: "Sandy Cheeks",
    message: "Howdy!",
  })
}
