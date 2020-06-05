export type EventMap<T> = T extends Window
  ? WindowEventMap
  : T extends Document
  ? DocumentEventMap
  : {[key: string]: Event}
