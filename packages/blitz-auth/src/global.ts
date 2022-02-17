import {SessionConfig} from "./shared/types"

declare global {
  export const _blitzGlobal: {
    sessionConfig: SessionConfig
  }
}

Object.assign(globalThis, {
  _blitzGlobal: {},
})
