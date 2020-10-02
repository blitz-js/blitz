// @ts-ignore
import {Request} from "express"

import {secureProxyMiddleware} from "./secure-proxy-middleware"
import {Socket} from "net"

// @ts-ignore
let reqSecure: Request = {
  connection: new Socket(),
  method: "GET",
  url: "/stuff?q=thing",
  headers: {
    "x-forwarded-proto": "https",
  },
}

// @ts-ignore
let reqHttp: Request = {
  connection: new Socket(),
  method: "GET",
  url: "/stuff?q=thing",
  headers: {
    "x-forwarded-proto": "http",
  },
}

// @ts-ignore
let reqNoHeader: Request = {
  connection: new Socket(),
  method: "GET",
  url: "/stuff?q=thing",
}

const res = {}

describe("secure proxy middleware", () => {
  it("should set https protocol if X-Forwarded-Proto is https", () => {
    // @ts-ignore
    secureProxyMiddleware(reqSecure, res, () => null)
    expect(reqSecure.protocol).toEqual("https")
  })

  it("should set http protocol if X-Forwarded-Proto is absent", () => {
    // @ts-ignore
    secureProxyMiddleware(reqNoHeader, res, () => null)
    expect(reqNoHeader.protocol).toEqual("http")
  })

  it("should set http protocol if X-Forwarded-Proto is http", () => {
    // @ts-ignore
    secureProxyMiddleware(reqHttp, res, () => null)
    expect(reqHttp.protocol).toEqual("http")
  })
})
