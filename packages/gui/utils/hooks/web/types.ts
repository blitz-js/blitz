export type EventArgs<T> = Omit<T, keyof Event>

export type EventMap<T> = T extends Window
  ? WindowEventMap
  : T extends Document
  ? DocumentEventMap
  : {[key: string]: Event}

export type JSONValue = string | number | boolean | JSONArray | JSONObject | null

export interface JSONArray extends Array<JSONValue> {}

export interface JSONObject {
  [key: string]: JSONValue
}
