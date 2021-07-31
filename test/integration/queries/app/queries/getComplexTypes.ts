const map = new Map().set("foo", "bar")

export default async function getComplexTypes() {
  return {
    date: new Date(0),
    map: "map",
    // obj: {
    //   one: 1,
    //   child: {
    //     two: 2,
    //   },
    // },
  }
}
