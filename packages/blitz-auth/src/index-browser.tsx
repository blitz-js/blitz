import {AppProps} from "next/app"
import {ComponentPropsWithoutRef} from "react"
import {BlitzPage, createClientPlugin} from "@blitzjs/next"

function getAuthValues(Page: BlitzPage, props: ComponentPropsWithoutRef<BlitzPage>) {
  if (!Page) return {}
  let authenticate = Page.authenticate
  let redirectAuthenticatedTo = Page.redirectAuthenticatedTo

  if (authenticate === undefined && redirectAuthenticatedTo === undefined) {
    const layout = Page.getLayout?.(<Page {...props} />)

    if (layout) {
      let currentElement = layout
      while (true) {
        const type = layout.type

        if (type.authenticate !== undefined || type.redirectAuthenticatedTo !== undefined) {
          authenticate = type.authenticate
          redirectAuthenticatedTo = type.redirectAuthenticatedTo
          break
        }

        if (currentElement.props?.children) {
          currentElement = currentElement.props?.children
        } else {
          break
        }
      }
    }
  }

  return {authenticate, redirectAuthenticatedTo}
}

function withBlitzAuthPlugin(Page: BlitzPage) {
  const AuthRoot: BlitzPage = (props: ComponentPropsWithoutRef<BlitzPage>) => {
    const {authenticate, redirectAuthenticatedTo} = getAuthValues(Page, props)

    if (authenticate || redirectAuthenticatedTo) {
      throw new Error("Auth error")
    }

    if (authenticate !== undefined || redirectAuthenticatedTo) {
      // @ts-ignore
      return <Page {...props} suppressFirstRenderFlicker={true} />
    }

    return <Page {...props} />
  }
  for (let [key, value] of Object.entries(Page)) {
    // @ts-ignore
    AuthRoot[key] = value
  }
  if (process.env.NODE_ENV !== "production") {
    AuthRoot.displayName = `BlitzInnerRoot`
  }

  return AuthRoot
}

export const AuthPlugin = createClientPlugin((options: any) => {
  return {
    withProvider: withBlitzAuthPlugin,
    events: {
      onSessionCreate: () => {},
      onSessionDestroy: () => {},
      onBeforeRender: (props: AppProps) => {
        console.log(props)
      },
    },
    middleware: {
      beforeHttpRequest: () => {},
      beforeHttpResponse: () => {},
    },
    exports: () => ({
      useSession: () => {
        return {userId: "123"}
      },
    }),
  }
})
