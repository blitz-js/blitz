export default async function setBasic(input, ctx) {
  global.basic = input
  return global.basic
}
