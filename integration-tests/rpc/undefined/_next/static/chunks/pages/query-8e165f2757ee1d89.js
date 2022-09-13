;(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [523],
  {
    894: function (e, t, r) {
      ;(window.__NEXT_P = window.__NEXT_P || []).push([
        "/query",
        function () {
          return r(23)
        },
      ])
    },
    23: function (e, t, r) {
      "use strict"
      r.r(t),
        r.d(t, {
          default: function () {
            return A
          },
        })
      var o = r(7458),
        n = r(1278),
        s = r(1071),
        a = r(1501),
        i = (r(8653), r(5225), r(3656))
      const c = "default" in a.ZP ? a.ZP.default : a.ZP,
        l = ["name", "message", "code", "statusCode", "meta", "url"]
      void 0 === i.env.JEST_WORKER_ID && c.allowErrorProps(...l)
      class u extends Error {
        constructor(e = "You must be logged in to access this") {
          super(e), (this.name = "AuthenticationError"), (this.statusCode = 401)
        }
        get _clearStack() {
          return !0
        }
      }
      void 0 === i.env.JEST_WORKER_ID &&
        c.registerClass(u, {identifier: "BlitzAuthenticationError", allowProps: l})
      class d extends Error {
        constructor() {
          super(...arguments), (this.name = "CSRFTokenMismatchError"), (this.statusCode = 401)
        }
        get _clearStack() {
          return !0
        }
      }
      void 0 === i.env.JEST_WORKER_ID &&
        c.registerClass(d, {identifier: "BlitzCSRFTokenMismatchError", allowProps: l})
      class h extends Error {
        constructor(e = "You are not authorized to access this") {
          super(e), (this.name = "AuthorizationError"), (this.statusCode = 403)
        }
        get _clearStack() {
          return !0
        }
      }
      void 0 === i.env.JEST_WORKER_ID &&
        c.registerClass(h, {identifier: "BlitzAuthorizationError", allowProps: l})
      class p extends Error {
        constructor(e = "This could not be found") {
          super(e), (this.name = "NotFoundError"), (this.statusCode = 404)
        }
        get _clearStack() {
          return !0
        }
      }
      void 0 === i.env.JEST_WORKER_ID &&
        c.registerClass(p, {identifier: "BlitzNotFoundError", allowProps: l})
      class f extends Error {
        constructor(e) {
          super("object" === typeof e ? e.href : e),
            (this.name = "RedirectError"),
            (this.statusCode = 302),
            (this.url = e)
        }
        get _clearStack() {
          return !0
        }
      }
      void 0 === i.env.JEST_WORKER_ID &&
        c.registerClass(f, {identifier: "BlitzRedirectError", allowProps: l})
      class _ extends Error {
        constructor(e = "The pagination arguments are invalid") {
          super(e), (this.name = "PaginationArgumentError"), (this.statusCode = 422)
        }
      }
      void 0 === i.env.JEST_WORKER_ID &&
        c.registerClass(_, {identifier: "BlitzPaginationArgumentError", allowProps: l})
      const E = "undefined" === typeof window,
        w = "undefined" !== typeof window
      function m(e) {
        if ("undefined" === typeof document) return null
        const t = document.cookie,
          r = t.search(new RegExp("\\b" + e + "=")),
          o = t.indexOf(";", r)
        let n
        return ~r
          ? ((n = decodeURIComponent(t.substring(r, ~o ? o : void 0).split("=")[1] || "")),
            "{" === n.charAt(0) ? JSON.parse(n) : n)
          : null
      }
      const v = (e) =>
        ((e, t, r) => {
          const o = `${e}=${t};path=/;expires=${r}`
          document.cookie = o
        })(e, "", "Thu, 01 Jan 1970 00:00:01 GMT")
      var g = r(8537),
        S = r(3582),
        T = (r(2983), r(7176))
      const y = () => {
          if (!globalThis.__BLITZ_SESSION_COOKIE_PREFIX)
            throw new Error(
              "Internal Blitz Error: globalThis.__BLITZ_SESSION_COOKIE_PREFIX is not set",
            )
          return globalThis.__BLITZ_SESSION_COOKIE_PREFIX
        },
        b = () => `${y()}_sPublicDataToken`,
        k = () => `${y()}_sAntiCsrfToken`,
        C = () => `${y()}_sPublicDataToken`
      const I = S.default,
        P =
          (T("blitz:auth-client"),
          (e) => {
            !(function (e, t) {
              if (!e) throw new Error(t)
            })(e, "[parsePublicDataToken] Failed: token is empty")
            const t = (0, g.Gh)(e)
            try {
              return {publicData: JSON.parse(t)}
            } catch (r) {
              throw new Error(`[parsePublicDataToken] Failed to parse publicDataStr: ${t}`)
            }
          }),
        R = {userId: null}
      class D {
        constructor() {
          ;(this.eventKey = "_blitz-publicDataUpdated"),
            (this.observable = I()),
            "undefined" !== typeof window &&
              (this.updateState(void 0, {suppressEvent: !0}),
              window.addEventListener("storage", (e) => {
                e.key === this.eventKey && this.updateState(void 0, {suppressEvent: !0})
              }))
        }
        updateState(e, t) {
          if (!t?.suppressEvent)
            try {
              localStorage.setItem(this.eventKey, Date.now().toString())
            } catch (r) {
              console.error("LocalStorage is not available", r)
            }
          this.observable.next(e ?? this.getData())
        }
        clear() {
          v(b()), localStorage.removeItem(C()), this.updateState(R)
        }
        getData() {
          const e = this.getToken()
          if (!e) return R
          const {publicData: t} = P(e)
          return t
        }
        getToken() {
          const e = m(b())
          return e ? (localStorage.setItem(C(), e), e) : localStorage.getItem(C())
        }
      }
      const O = () => (
          window.__publicDataStore || (window.__publicDataStore = new D()), window.__publicDataStore
        ),
        N = () => {
          const e = m(`${y()}_sAntiCsrfToken`)
          return e ? (localStorage.setItem(k(), e), e) : localStorage.getItem(k())
        }
      var B = r(3656)
      "undefined" !== typeof self &&
        self.requestIdleCallback &&
        self.requestIdleCallback.bind(window)
      const z = () => globalThis.queryClient
      ;(() => {
        const e = () => new Promise(() => {})
        e._isRpcClient = !0
      })()
      const q = () => void 0 === B.env.JEST_WORKER_ID || void 0 !== B.env.BLITZ_TEST_ENVIRONMENT,
        K = (e) => (t) => {
          if (E) return t
          ;((e) => {
            if (w && !e._isRpcClient && q())
              throw new Error(
                'Either the file path to your resolver is incorrect (must be in a "queries" or "mutations" folder that isn\'t nested inside "pages" or "api") or you are trying to use Blitz\'s useQuery to fetch from third-party APIs (to do that, import useQuery directly from "@tanstack/react-query").',
              )
          })(t)
          const r = t,
            o = "mutation" === e ? "useMutation" : "useQuery"
          if (r._resolverType !== e && q())
            throw new Error(
              `"${o}" was expected to be called with a ${e} but was called with a "${r._resolverType}"`,
            )
          return r
        },
        x =
          (K("query"),
          K("mutation"),
          (e, t) => {
            const r = [e],
              o = "function" === typeof t ? t() : t
            return r.push((0, a.qC)(o)), r
          })
      var F = (function ({resolverName: e, resolverType: t, routePath: o}) {
          const i = ((c = "/api/rpc" + o), (0, n.normalizePathTrailingSlash)((0, s.addBasePath)(c)))
          var c
          const l = async (e, t = {}, n) => {
            const s = (await Promise.resolve().then(r.t.bind(r, 7176, 19))).default("blitz:rpc")
            if (
              (t.fromQueryHook ||
                t.fromInvoke ||
                console.warn(
                  "[Deprecation] Directly calling queries/mutations is deprecated in favor of invoke(queryFn, params)",
                ),
              E)
            )
              return Promise.resolve()
            s("Starting request for", i, "with", e, "and", t)
            const c = {"Content-Type": "application/json"},
              l = N()
            let u
            l
              ? (s("Adding antiCSRFToken cookie header", l), (c["anti-csrf"] = l))
              : s("No antiCSRFToken cookie found"),
              (u = t.alreadySerialized ? e : (0, a.qC)(e))
            return window
              .fetch(i, {
                method: "POST",
                headers: c,
                credentials: "include",
                redirect: "follow",
                body: JSON.stringify({params: u.json, meta: {params: u.meta}}),
                signal: n,
              })
              .then(async (r) => {
                if (
                  (s("Received request for", o),
                  r.headers &&
                    (r.headers.get("public-data-token") &&
                      (O().updateState(), s("Public data updated")),
                    r.headers.get("session-created") &&
                      (s("Session created"),
                      setTimeout(async () => {
                        s("Invalidating react-query cache..."),
                          await z().cancelQueries(),
                          await z().resetQueries(),
                          z().getMutationCache().clear()
                      }, 100)),
                    r.headers.get("csrf-error")))
                ) {
                  const e = new d()
                  throw ((e.stack = null), e)
                }
                if (r.ok) {
                  let s
                  try {
                    s = await r.json()
                  } catch (n) {
                    const e = new Error(`Failed to parse json from ${o}`)
                    throw ((e.stack = null), e)
                  }
                  if (s.error) {
                    let e = (0, a.vB)({json: s.error, meta: s.meta?.error})
                    "AuthenticationError" === e.name && O().getData().userId && O().clear()
                    const t = e.message.match(/invalid.*prisma.*invocation/i)
                    throw (
                      (t && !("code" in e) && ((e = new Error(t[0])), (e.statusCode = 500)),
                      (e.stack = null),
                      e)
                    )
                  }
                  {
                    const r = (0, a.vB)({json: s.result, meta: s.meta?.result})
                    if (!t.fromQueryHook) {
                      const t = x(o, e)
                      z().setQueryData(t, r)
                    }
                    return r
                  }
                }
                {
                  const e = new Error(r.statusText)
                  throw ((e.statusCode = r.status), (e.path = o), (e.stack = null), e)
                }
              })
          }
          return (
            (l._isRpcClient = !0),
            (l._resolverName = e),
            (l._resolverType = t),
            (l._routePath = i),
            l
          )
        })({resolverName: "getBasic", resolverType: "query", routePath: "/getBasic"}),
        A = function () {
          return (
            F().then(console.log),
            (0, o.jsx)("div", {id: "page-container", children: "Hello World"})
          )
        }
    },
    8653: function () {},
    5225: function () {},
  },
  function (e) {
    e.O(0, [774, 29, 888, 179], function () {
      return (t = 894), e((e.s = t))
      var t
    })
    var t = e.O()
    _N_E = t
  },
])
