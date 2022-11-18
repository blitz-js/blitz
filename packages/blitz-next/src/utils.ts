export function merge<T, U>([...fns]: Array<(args: T) => U>) {
  return (args: T) => fns.map((fn) => fn(args))
}

export function pipe<T>(...fns: Array<(x: T) => T>) {
  return (x: T) => fns.reduce((v, f) => f(v), x)
}
