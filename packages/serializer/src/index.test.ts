import {serialize, deserialize} from "."

const input = {
  normal: "string",

  timestamp: new Date(),
  test: /blitz/,
  set: new Set([1, 2]),
  map: new Map([["hello", "world"]]),
}

it("should work", () => {
  const {json, meta} = serialize(input)

  expect(deserialize(json, meta)).toStrictEqual(input)
})

// it("should be performant", () => {
//   const start = new Date()

//   for (let i = 0; i < 1000; i++) {
//     const {json, meta} = serialize(input)

//     deserialize(json, meta)
//   }

//   const end = new Date()

//   expect(end.getTime() - start.getTime()).toBeLessThanOrEqual(1000)
// })

// it("should handle large objects", () => {
//   const large = {...Array(10000).fill(Math.random().toString(36).substring(7))}

//   const start = new Date()

//   const {json, meta} = serialize(large)

//   deserialize(json, meta)

//   const end = new Date()

//   // NOTE(@merelinguist) this is probably good enough for now, but I’d
//   // welcome any efforts to make the serializers even faster.
//   expect(end.getTime() - start.getTime()).toBeLessThanOrEqual(5000)
// })
