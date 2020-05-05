export function ciLog(name: string, obj: any) {
  if (process.env.CI && process.env.JEST_WORKER_ID !== undefined) {
    console.log('JEST_WORKER_ID:', process.env.JEST_WORKER_ID)
    console.log(name + '\n' + JSON.stringify(obj, null, 2) + '\n')
  }
  return obj
}
