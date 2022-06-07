# Blitz localization with next-rosetta Example

This example shows how to use [next-rosetta](https://www.npmjs.com/package/next-rosetta) to translate your application. It has English and French locales and need to be adapted to your own use case.

## Getting started

### Install dependencies

```
# with npm
npm install next-rosetta

# with yarn
yarn add next-rosetta
```

### Configure the international routing in the `blitz.config.ts` file

```ts
// blitz.config.ts
import { BlitzConfig } from "blitz"

const config: BlitzConfig = {
  i18n: {
    // These are all the locales you want to support
    locales: ["en", "fr"],
    // This is the default locale you want to be used when visiting
    // a path without locale prefix e.g. `/users`
    defaultLocale: "en",
  },
}
module.exports = config
```

### Create locales

Create a directory named `i18n` in your project. If you are using TypeScript you can define the type schema and create every locale based on that interface. An example:

```ts
export interface MyLocale {
  locale: string
  home: {
    logout: string
    userId: string
    userRole: string
    signUp: string
    login: string
    welcome: {
      part1: string
      part2: string
    }
...
```

Then you can add files with translations. Here's an English example:

```ts
import type { MyLocale } from "."

export const table: MyLocale = {
  locale: "English",
  home: {
    logout: "Logout",
    userId: "User Id",
    userRole: "User Role",
    signUp: "Sign Up",
    login: "Login",
    welcome: {
      part1: "Congrats!",
      part2: " Your app is ready, including user sign-up and log-in.",
    },
...
```

### Add the i18n provider in `app/pages/_app.tsx`

```diff
import { I18nProvider } from "next-rosetta"

export default function App({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || ((page) => page)

  return (
+   <I18nProvider table={pageProps.table}>
      <ErrorBoundary
        FallbackComponent={RootErrorFallback}
        onReset={useQueryErrorResetBoundary().reset}
      >
        {getLayout(<Component {...pageProps} />)}
      </ErrorBoundary>
+   </I18nProvider>
  )
}
```

### Use `next-rosetta` in your components

Here is an example if you are using `getStaticProps`:

```ts
// app/pages/index.tsx
import type { GetStaticProps } from "next"
import { useI18n, I18nProps } from "next-rosetta"

import type { MyLocale } from "../i18n"

function HomePage() {
  const { t } = useI18n<MyLocale>()
  return (
    <div>
      <h3>{t("title")}</h3>
      <p>{t("welcome", { name: "John" })}</p>
      <button>{t("profile.button")}</button>
    </div>
  )
}

// You can use I18nProps<T> for type-safety (optional)
export const getStaticProps: GetStaticProps<I18nProps<MyLocale>> = async (context) => {
  const locale = context.locale || context.defaultLocale
  const { table = {} } = await import(`../i18n/${locale}`) // Import locale
  return { props: { table } } // Passed to `app/pages/_app.tsx`
}
```

Take a look at the following files to see how `next-rosetta` can be used in a Blitz application:

- `app/pages/index.tsx`
- `app/auth/components/LoginForm.tsx`
- `app/auth/pages/login.tsx`

Refer to the [docs](https://github.com/useflyyer/next-rosetta) for more examples.
