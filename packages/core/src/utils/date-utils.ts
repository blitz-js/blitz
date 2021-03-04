const MILLISECONDS_IN_MINUTE = 60000
const MINUTES_IN_YEAR = 525960

export const isPast = (date: Date) => {
  return date.getTime() < Date.now()
}

export function differenceInMilliseconds(dateLeft: Date, dateRight: Date) {
  return dateLeft.getTime() - dateRight.getTime()
}

export function differenceInMinutes(dateLeft: Date, dateRight: Date) {
  const diff = differenceInMilliseconds(dateLeft, dateRight) / MILLISECONDS_IN_MINUTE
  return diff > 0 ? Math.floor(diff) : Math.ceil(diff)
}

export function addMilliseconds(date: Date, amount: number): Date {
  const timestamp = date.getTime()
  const cleanAmount = toInteger(amount)
  return new Date(timestamp + cleanAmount)
}

export function addMinutes(date: Date, amount: number): Date {
  const cleanAmount = toInteger(amount)
  return addMilliseconds(date, cleanAmount * MILLISECONDS_IN_MINUTE)
}

export function addYears(date: Date, amount: number): Date {
  const cleanAmount = toInteger(amount)
  return addMinutes(date, cleanAmount * MINUTES_IN_YEAR)
}

export function toInteger(dirtyNumber: unknown) {
  if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) {
    return NaN
  }

  const number = Number(dirtyNumber)

  if (isNaN(number)) {
    return number
  }

  return number < 0 ? Math.ceil(number) : Math.floor(number)
}
