import db from "./index"

const randomString = (len: number, offset = 3) => {
  let output = ""

  for (let i = 0; i < len + Math.ceil((Math.random() - 0.5) * offset); i++) {
    const ascii = Math.floor(Math.random() * 26) + (i % 2 === 0 ? 97 : 65)
    output += String.fromCharCode(ascii)
  }

  return output
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
  for (let i = 0; i < 5; i++) {
    await db.product.create({data: randomProduct()})
  }
  await db.user.create({data: {email: randomString(5) + "@bar.com", name: "Foobar"}})
}

export default seed
