import rimrafCallback, {Options} from "rimraf"

export function rimraf(f: string, opts: Options = {}) {
  return new Promise<void>((res, rej) => {
    rimrafCallback(f, opts, (error) => {
      if (error) {
        rej(error)
      } else {
        res()
      }
    })
  })
}
