import {extractRouterParams, useParam, useParams, useRouterQuery} from "../src/router/router-hooks"
import {renderHook} from "./test-utils"

describe("useRouterQuery", () => {
  it("returns proper values", () => {
    const {result} = renderHook(() => useRouterQuery(), {
      router: {asPath: "/?foo=foo&num=0&bool=true&float=1.23&empty"},
    })

    expect(result.current).toEqual({
      foo: "foo",
      num: "0",
      bool: "true",
      float: "1.23",
      empty: "",
    })
  })

  it("decode correctly", () => {
    const {result} = renderHook(() => useRouterQuery(), {
      router: {asPath: "/?encoded=D%C3%A9j%C3%A0%20vu&spaces=Hello+World&both=Hola%2C+Mundo%21"},
    })

    expect(result.current).toEqual({
      encoded: "Déjà vu",
      spaces: "Hello World",
      both: "Hola, Mundo!",
    })
  })
})

describe("extractRouterParams", () => {
  it("returns proper params", () => {
    const routerQuery = {
      id: "1",
      cat: "category",
      slug: ["example", "multiple", "slugs"],
      empty: "",
      queryArray: ["1", "123", ""],
    }

    const query = {
      cat: "somethingelse",
      slug: ["query-slug"],
      queryArray: ["1", "123", ""],
      onlyInQuery: "onlyInQuery",
    }

    const params = extractRouterParams(routerQuery, query)
    expect(params).toEqual({
      id: "1",
      cat: "category",
      slug: ["example", "multiple", "slugs"],
      empty: "",
    })
  })
})

describe("useParams", () => {
  it("works without parameter", () => {
    // This is the router query object which includes route params
    const query = {
      id: "1",
      cat: "category",
      slug: ["example", "multiple", "slugs"],
      empty: "",
    }

    const {result} = renderHook(() => useParams(), {router: {query}})
    expect(result.current).toEqual({
      id: "1",
      cat: "category",
      slug: ["example", "multiple", "slugs"],
      empty: "",
    })
  })

  it("works with string", () => {
    // This is the router query object which includes route params
    const query = {
      id: "1",
      cat: "category",
      slug: ["example", "multiple", "slugs"],
      empty: "",
    }

    const {result} = renderHook(() => useParams("string"), {router: {query}})
    expect(result.current).toEqual({
      id: "1",
      cat: "category",
      empty: "",
    })
  })

  it("works with number", () => {
    // This is the router query object which includes route params
    const query = {
      id: "1",
      cat: "category",
      slug: ["example", "multiple", "slugs"],
      empty: "",
    }

    const {result} = renderHook(() => useParams("number"), {router: {query}})
    expect(result.current).toEqual({
      id: 1,
      cat: undefined,
      slug: undefined,
    })
  })

  it("works with array", () => {
    // This is the router query object which includes route params
    const query = {
      id: "1",
      cat: "category",
      slug: ["example", "multiple", "slugs"],
      empty: "",
    }

    const {result} = renderHook(() => useParams("array"), {router: {query}})
    expect(result.current).toEqual({
      id: ["1"],
      cat: ["category"],
      slug: ["example", "multiple", "slugs"],
      empty: [""],
    })
  })
})

describe("useParam", () => {
  it("works without parameter", () => {
    // This is the router query object which includes route params
    const query = {
      id: "1",
      cat: "category",
      slug: ["example", "multiple", "slugs"],
      empty: "",
    }

    let {result} = renderHook(() => useParam("id"), {router: {query}})
    expect(result.current).toEqual("1")
    ;({result} = renderHook(() => useParam("cat"), {router: {query}}))
    expect(result.current).toEqual("category")
    ;({result} = renderHook(() => useParam("slug"), {router: {query}}))
    expect(result.current).toEqual(["example", "multiple", "slugs"])
    ;({result} = renderHook(() => useParam("empty"), {router: {query}}))
    expect(result.current).toEqual("")
    ;({result} = renderHook(() => useParam("doesnt-exist"), {router: {query}}))
    expect(result.current).toBeUndefined()
  })

  it("works with string", () => {
    // This is the router query object which includes route params
    const query = {
      id: "1",
      cat: "category",
      slug: ["example", "multiple", "slugs"],
      empty: "",
    }

    let {result} = renderHook(() => useParam("id", "string"), {router: {query}})
    expect(result.current).toEqual("1")
    ;({result} = renderHook(() => useParam("cat", "string"), {router: {query}}))
    expect(result.current).toEqual("category")
    ;({result} = renderHook(() => useParam("slug", "string"), {router: {query}}))
    expect(result.current).toEqual(undefined)
    ;({result} = renderHook(() => useParam("empty", "string"), {router: {query}}))
    expect(result.current).toEqual("")
    ;({result} = renderHook(() => useParam("doesnt-exist", "string"), {router: {query}}))
    expect(result.current).toBeUndefined()
  })

  it("works with number", () => {
    // This is the router query object which includes route params
    const query = {
      id: "1",
      cat: "category",
      slug: ["example", "multiple", "slugs"],
      empty: "",
    }

    let {result} = renderHook(() => useParam("id", "number"), {router: {query}})
    expect(result.current).toEqual(1)
    ;({result} = renderHook(() => useParam("cat", "number"), {router: {query}}))
    expect(result.current).toBeUndefined()
    ;({result} = renderHook(() => useParam("slug", "number"), {router: {query}}))
    expect(result.current).toBeUndefined()
    ;({result} = renderHook(() => useParam("empty", "number"), {router: {query}}))
    expect(result.current).toBeUndefined()
    ;({result} = renderHook(() => useParam("doesnt-exist", "number"), {router: {query}}))
    expect(result.current).toBeUndefined()
  })

  it("works with array", () => {
    // This is the router query object which includes route params
    const query = {
      id: "1",
      cat: "category",
      slug: ["example", "multiple", "slugs"],
      empty: "",
    }

    let {result} = renderHook(() => useParam("id", "array"), {router: {query}})
    expect(result.current).toEqual(["1"])
    ;({result} = renderHook(() => useParam("cat", "array"), {router: {query}}))
    expect(result.current).toEqual(["category"])
    ;({result} = renderHook(() => useParam("slug", "array"), {router: {query}}))
    expect(result.current).toEqual(["example", "multiple", "slugs"])
    ;({result} = renderHook(() => useParam("empty", "array"), {router: {query}}))
    expect(result.current).toEqual([""])
    ;({result} = renderHook(() => useParam("doesnt-exist", "array"), {router: {query}}))
    expect(result.current).toBeUndefined()
  })
})
