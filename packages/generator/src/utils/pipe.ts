export function pipe(...fns: Function[]): (initial: any) => any {
  return function piper(initial: any): any {
    return fns.reduce((acc, val) => val(acc), initial)
  }
}
