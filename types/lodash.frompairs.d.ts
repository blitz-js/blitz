declare module "lodash.frompairs" {
  // eslint-disable-next-line
  export default function fromPairs<T>(pairs: List<[string, T]> | null | undefined): Dictionary<T>
}
