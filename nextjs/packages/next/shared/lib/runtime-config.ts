let runtimeConfig: any

export function getConfig() {
  return runtimeConfig
}
export default getConfig

export function setConfig(configValue: any): void {
  runtimeConfig = configValue
}
