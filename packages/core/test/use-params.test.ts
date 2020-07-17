import {extractRouterParams, useParams} from "../src/use-params"
import {renderHook} from "./test-utils"

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
      cat: NaN,
      slug: NaN,
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
      slug: ["example", "multiple", "slugs"],
    })
  })
})
