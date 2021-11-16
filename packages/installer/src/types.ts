import type * as j from "jscodeshift"

export interface RecipeMeta {
  name: string
  description: string
  owner: string
  repoLink: string
}

export type RecipeCLIArgs = {[Key in string]?: string | true}

export interface RecipeCLIFlags {
  yesToAll: boolean
}

export type Program = j.Collection<j.Program>

/**
Matches a JSON object.
This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from. Don't use this as a direct return type as the user would have to double-cast it: `jsonObject as unknown as CustomResponse`. Instead, you could extend your CustomResponse type from it to ensure your type only uses JSON-compatible types: `interface CustomResponse extends JsonObject { … }`.
@see https://github.com/sindresorhus/type-fest
*/
export type JsonObject = {[Key in string]?: JsonValue}

/**
Matches a JSON array.
@see https://github.com/sindresorhus/type-fest
*/
export type JsonArray = JsonValue[]

/**
Matches any valid JSON primitive value.
@see https://github.com/sindresorhus/type-fest
*/
export type JsonPrimitive = string | number | boolean | null

/**
Matches any valid JSON value.
@see https://github.com/sindresorhus/type-fest
*/
export type JsonValue = JsonPrimitive | JsonObject | JsonArray
