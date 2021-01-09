export function pipe(...fns: Function[]): (initial: any, ...args: any[]) => any {
  return function piper(initial: any, ...args: any[]): any {
    return fns.reduce((acc, val) => val(acc, ...args), initial)
  }
}
