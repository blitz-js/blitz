declare module 'resolve-bin' {
  type Cb = (err: Error, bin: string) => void
  type Options = {executable?: boolean}
  export default function resolveBin(mod: string, opts: Cb | Options, callback?: Cb): void
}
