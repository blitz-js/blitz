import {pluralCamel, pluralPascal, singleCamel, singlePascal} from "../index"

export function modelName(input: string = "") {
  return singleCamel(input)
}
export function modelNames(input: string = "") {
  return pluralCamel(input)
}
export function ModelName(input: string = "") {
  return singlePascal(input)
}
export function ModelNames(input: string = "") {
  return pluralPascal(input)
}
