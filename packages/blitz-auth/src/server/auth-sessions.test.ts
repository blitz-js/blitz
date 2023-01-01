import {expect, describe, it} from "vitest"
import {setCookie} from "./auth-sessions"
import cookie from "cookie"
import {ServerResponse} from "http"

describe("blitz-auth", () => {
  describe("setCookie", () => {
    it("works with empty start", async () => {
      const res = new ServerResponse({} as any)
      setCookie(res, cookie.serialize("A", "a-value", {}))
      expect(res.getHeader("Set-Cookie")).toBe("A=a-value")
    })

    it("works with string start", async () => {
      const res = new ServerResponse({} as any)
      res.setHeader("Set-Cookie", cookie.serialize("A", "a-value", {}))
      setCookie(res, cookie.serialize("B", "b-value", {}))
      expect(res.getHeader("Set-Cookie")).toEqual(["A=a-value", "B=b-value"])
    })

    it("works with array start for new name", async () => {
      const res = new ServerResponse({} as any)
      res.setHeader("Set-Cookie", [
        cookie.serialize("A", "a-value", {}),
        cookie.serialize("B", "b-value", {}),
      ])
      setCookie(res, cookie.serialize("C", "c-value", {}))
      expect(res.getHeader("Set-Cookie")).toEqual(["A=a-value", "B=b-value", "C=c-value"])
    })

    it("works with array start for existing name", async () => {
      const res = new ServerResponse({} as any)
      res.setHeader("Set-Cookie", [
        cookie.serialize("A", "a-value", {}),
        cookie.serialize("B", "b-value", {}),
      ])
      setCookie(res, cookie.serialize("A", "new-a-value", {}))
      expect(res.getHeader("Set-Cookie")).toEqual(["A=new-a-value", "B=b-value"])
    })
  })
})
