export function isLocalhost(req: any): boolean {
  let {host} = req.headers
  let localhost = false
  if (host) {
    host = host.split(":")[0]
    localhost = host === "localhost"
  }
  return localhost
}
