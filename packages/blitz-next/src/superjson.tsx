import hoistNonReactStatics from "hoist-non-react-statics"
import type {GetServerSidePropsResult, GetStaticPropsResult} from "next"
import {AppProps} from "next/app"
import * as React from "react"
import SuperJSON from "superjson"

export type SuperJSONProps<P = any> = P & {
  _superjson?: any
}

type Result = Partial<GetServerSidePropsResult<any> & GetStaticPropsResult<any>>

export function withSuperJsonProps<T extends Result>(result: T, exclude: string[] = []) {
  if (!("props" in result)) {
    return result
  }

  if (!result.props) {
    return result
  }

  const excludedPropValues = exclude.map((propKey) => {
    const value = (result.props as any)[propKey]
    delete (result.props as any)[propKey]
    return value
  })

  const {json, meta} = SuperJSON.serialize(result.props)
  const props = json as any

  if (meta) {
    props._superjson = meta
  }

  exclude.forEach((key, index) => {
    const excludedPropValue = excludedPropValues[index]
    if (typeof excludedPropValue !== "undefined") {
      props[key] = excludedPropValue
    }
  })

  return {
    ...result,
    props,
  }
}

export function deserializeProps<P>(serializedProps: SuperJSONProps<P>): P {
  const {_superjson, ...props} = serializedProps
  return SuperJSON.deserialize({json: props as any, meta: _superjson})
}

export function withSuperJSONPage<P extends AppProps>(
  Page: React.ComponentType<P>,
): React.ComponentType<SuperJSONProps<P>> {
  function WithSuperJSON(serializedProps: SuperJSONProps<P>) {
    return <Page {...deserializeProps<P>(serializedProps)} />
  }

  hoistNonReactStatics(WithSuperJSON, Page)

  return WithSuperJSON
}
