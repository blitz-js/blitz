if (typeof window !== "undefined") {
  throw new Error("This should not be loaded on the client")
}

export default async function getBasic() {
  if (typeof window !== "undefined") {
    throw new Error("This should not be loaded on the client")
  }

  global.basic ??= "basic-result"
  return global.basic
}
