import db from "./index"
const seed = async () => {
  const user = await db.user.create({data: {name: "FooBar", email: "hey@" + new Date().getTime()}})
  console.log("Created user", user)
}
export default seed
