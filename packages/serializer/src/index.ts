import every from "lodash/every"
import isBoolean from "lodash/isBoolean"
import isNull from "lodash/isNull"
import isNumber from "lodash/isNumber"
import isPlainObject from "lodash/isPlainObject"
import isString from "lodash/isString"
import isUndefined from "lodash/isUndefined"
import overSome from "lodash/overSome"

const isSerializable = (value: any) => {
  const nestedSerialisable: any = (v: any) =>
    (isPlainObject(v) || Array.isArray(v)) && every(v, isSerializable)

  return overSome([isUndefined, isNull, isBoolean, isNumber, isString, nestedSerialisable])(value)
}

export const serialize = (input: {[key: string]: any}) => {
  let json: {[key: string]: any} = {}
  let meta: {[key: string]: string} = {}

  for (let i = 0, len = Object.keys(input).length; i < len; i++) {
    const key = Object.keys(input)[i]
    const value = Object.values(input)[i]

    if (isSerializable(value)) {
      json[key] = value
    }

    if (typeof value === "undefined") {
      json[key] = "undefined"
      meta[key] = "undefined"
    }

    if (typeof value === "bigint") {
      json[key] = Number(value)
      meta[key] = "bigint"
    }

    if (value instanceof Date) {
      json[key] = value.toISOString()
      meta[key] = "Date"
    }

    if (value instanceof Map) {
      json[key] = [...value]
      meta[key] = "Map"
    }

    if (value instanceof RegExp) {
      json[key] = new RegExp(value).source
      meta[key] = "RegExp"
    }

    if (value instanceof Set) {
      json[key] = [...value]
      meta[key] = "Set"
    }
  }

  return {json, meta}
}

export const deserialize = (json: {[key: string]: any}, meta: {[key: string]: string}) => {
  let ouput: {[key: string]: any} = {}

  for (let i = 0, len = Object.keys(json).length; i < len; i++) {
    const key = Object.keys(json)[i]
    const value = Object.values(json)[i]
    const metaValue = meta[key]

    if (!metaValue) {
      ouput[key] = value
    }

    if (metaValue === "undefined") {
      ouput[key] = undefined
    }

    if (metaValue === "bigint") {
      ouput[key] = BigInt(value)
    }

    if (metaValue === "Date") {
      ouput[key] = new Date(value as string)
    }

    if (metaValue === "Map") {
      ouput[key] = new Map(value as any)
    }

    if (metaValue === "RegExp") {
      ouput[key] = RegExp(value as string)
    }

    if (metaValue === "Set") {
      ouput[key] = new Set(value as any)
    }
  }

  return ouput
}
