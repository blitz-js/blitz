let runtimeConfig: any

export default getConfig
export function getConfig() {
  return runtimeConfig
}

export function setConfig(configValue: any): void {
  runtimeConfig = configValue
}
