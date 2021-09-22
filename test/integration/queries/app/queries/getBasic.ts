import delay from "delay"

export default async function getBasic() {
  await delay(250)
  return "basic-result"
}
