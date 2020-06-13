import db from "./index"

const randomString = (len: number, offset = 3) => {
  return Array.from(
    new Array(Math.ceil(len + Math.floor((Math.random() - 0.5) * offset))),
    (_, i) => {
      if (i % 2 === 0) {
        return String.fromCharCode(Math.floor(Math.random() * 26) + 97)
      }
      return String.fromCharCode(Math.floor(Math.random() * 26) + 65)
    }
  ).join("")
}

const randomProduct = () => {
  return {
    name: randomString(10),
    handle: randomString(6, 0),
    description: Array.from(new Array(10), () => randomString(10)).join(" "),
    price: Math.floor(Math.random() * 10000),
  }
}

const seed = async () => {
  await Promise.all(Array.from(new Array(5), () => db.product.create({ data: randomProduct() })))
  await db.user.create({ data: { email: "foo@bar.com", name: "Foobar" } })
}

export default seed
