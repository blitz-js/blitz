export const managedInterval = (callback: () => void, delayMs: number): (() => void) => {
  const id = setInterval(callback, delayMs)
  return (): void => {
    clearInterval(id)
  }
}
