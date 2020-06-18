// based on https://github.com/withspectrum/spectrum/blob/alpha/shared/time-difference.js

export const timeDifference = (current: number, previous: number): string => {
  const msPerMinute = 60 * 1000
  const msPerHour = msPerMinute * 60
  const msPerDay = msPerHour * 24
  const msPerMonth = msPerDay * 30
  const msPerYear = msPerDay * 365

  let elapsed = current - previous

  if (elapsed < msPerMinute) {
    return "just now"
  } else if (elapsed < msPerHour) {
    const now = Math.round(elapsed / msPerMinute)
    if (now === 1) {
      return "1 minute ago"
    } else {
      return `${now} minutes ago`
    }
  } else if (elapsed < msPerDay) {
    const now = Math.round(elapsed / msPerHour)
    if (now === 1) {
      return "1 hour ago"
    } else {
      return `${now} hours ago`
    }
  } else if (elapsed < msPerMonth) {
    const now = Math.round(elapsed / msPerDay)
    if (now === 1) {
      return "yesterday"
    } else if (now >= 7 && now <= 13) {
      return "1 week ago"
    } else if (now >= 14 && now <= 20) {
      return "2 weeks ago"
    } else if (now >= 21 && now <= 28) {
      return "3 weeks ago"
    } else {
      return `${now} days ago`
    }
  } else if (elapsed < msPerYear) {
    const now = Math.round(elapsed / msPerMonth)
    if (now === 1) {
      return "1 month ago"
    } else {
      return `${now} months ago`
    }
  } else {
    const now = Math.round(elapsed / msPerYear)
    if (now === 1) {
      return "1 year ago"
    } else {
      return `${now} years ago`
    }
  }
}
