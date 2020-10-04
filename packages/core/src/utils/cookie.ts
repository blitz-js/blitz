// Taken from https://github.com/HenrikJoreteg/cookie-getter
// simple commonJS cookie reader, best perf according to http://jsperf.com/cookie-parsing
export function readCookie(name: string) {
  if (typeof document === "undefined") return null
  const cookie = document.cookie
  const setPos = cookie.search(new RegExp("\\b" + name + "="))
  const stopPos = cookie.indexOf(";", setPos)
  let res
  if (!~setPos) return null
  res = decodeURIComponent(cookie.substring(setPos, ~stopPos ? stopPos : undefined).split("=")[1])
  return res.charAt(0) === "{" ? JSON.parse(res) : res
}

export const setCookie = (name: string, value: string, expires: string) => {
  const result = `${name}=${value};path=/;expires=${expires}`
  document.cookie = result
}
export const deleteCookie = (name: string) => setCookie(name, "", "Thu, 01 Jan 1970 00:00:01 GMT")
