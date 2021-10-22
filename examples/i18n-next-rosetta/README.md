# Blitz localization with next-rosetta Example



## Intro



This example shows how to use [next-rosetta](https://www.npmjs.com/package/next-rosetta) to localize your application. This example show an English/French translation and need to be adapted to your own situation.

  ## Install and configure

## Getting Started



### Install the next-rosetta package:



```

# with npm

npm install next-rosetta



# with yarn

yarn add next-rosetta

```



### Configure the international routing in the `blitz.config.ts` file

```ts
  i18n: {
    // These are all the locales you want to support in
    // your application
    locales: ["en", "fr"],
    // This is the default locale you want to be used when visiting
    // a non-locale prefixed path e.g. `/hello`
    defaultLocale: "en",
  },
```

## Add the localization files

Interface definition: `app/core/i18n/index.tsx`
```ts
// Check: https://github.com/useflyyer/next-rosetta

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

English: `app/core/i18n/en.tsx`
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

French: `app/core/i18n/en.tsx`
```ts
import type { MyLocale } from "."

export const table: MyLocale = {
  locale: "Français",
  home: {
    logout: "Deconnexion",
    userId: "Id",
    userRole: "Role",
    signUp: "Créez un compte",
    login: "Connexion",
    welcome: {
      part1: "Bravo!",
      part2:
        " Votre application est prête, incluant la création de compte utilisateurs et la connexion.",
    },
...
```
## Add the provider in the app `app/pages/_app.tsx`
```ts
import { I18nProvider } from "next-rosetta"
```

```ts
export default function App({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || ((page) => page)

  return (
    <I18nProvider table={pageProps.table}>
      <ErrorBoundary
        FallbackComponent={RootErrorFallback}
        onReset={useQueryErrorResetBoundary().reset}
      >
        {getLayout(<Component {...pageProps} />)}
      </ErrorBoundary>
    </I18nProvider>
  )
}
```
## Connect your page & components with next-rosetta and the translation. The language files are fetched within the `GetStaticProps`:
`app/pages/index.tsx`:
```diff
diff --git a/app/pages/index.tsx b/app/pages/index.tsx
index b49e733..69759f6 100644
--- a/app/pages/index.tsx
+++ b/app/pages/index.tsx
@@ -4,7 +4,9 @@ import Layout from "app/core/layouts/Layout"
 import { useCurrentUser } from "app/core/hooks/useCurrentUser"
 import logout from "app/auth/mutations/logout"
 import logo from "public/logo.png"
-
+import type { GetStaticProps } from "blitz"
+import { useI18n, I18nProps } from "next-rosetta"
+import type { MyLocale } from "app/core/i18n"
 /*
  * This file is just for a pleasant getting started page for your new app.
  * You can delete everything in here and start from scratch if you like.
@@ -13,6 +15,7 @@ import logo from "public/logo.png"
 const UserInfo = () => {
   const currentUser = useCurrentUser()
   const [logoutMutation] = useMutation(logout)
+  const { t } = useI18n<MyLocale>()

   if (currentUser) {
     return (
@@ -23,12 +26,12 @@ const UserInfo = () => {
             await logoutMutation()
           }}
         >
-          Logout
+          {t("home.logout")}
         </button>
         <div>
-          User id: <code>{currentUser.id}</code>
+          {t("home.userId")}: <code>{currentUser.id}</code>
           <br />
-          User role: <code>{currentUser.role}</code>
+          {t("home.userRole")}: <code>{currentUser.role}</code>
         </div>
       </>
     )
@@ -37,12 +40,12 @@ const UserInfo = () => {
       <>
         <Link href={Routes.SignupPage()}>
           <a className="button small">
-            <strong>Sign Up</strong>
+            <strong>{t("home.signUp")}</strong>
           </a>
         </Link>
         <Link href={Routes.LoginPage()}>
           <a className="button small">
-            <strong>Login</strong>
+            <strong>{t("home.login")}</strong>
           </a>
         </Link>
       </>
@@ -50,15 +53,31 @@ const UserInfo = () => {
   }
 }

+const LangSelect = () => {
+  return (
+    <div>
+      <Link href="/" locale="en">
+        English
+      </Link>{" "}
+      <Link href="/" locale="fr">
+        Français
+      </Link>
+    </div>
+  )
+}
+
 const Home: BlitzPage = () => {
+  const { t } = useI18n<MyLocale>()
   return (
     <div className="container">
+      <LangSelect></LangSelect>
       <main>
         <div className="logo">
           <Image src={logo} alt="blitzjs" />
         </div>
         <p>
-          <strong>Congrats!</strong> Your app is ready, including user sign-up and log-in.
+          <strong>{t("home.welcome.part1")}</strong>
+          {t("home.welcome.part2")}
         </p>
         <div className="buttons" style={{ marginTop: "1rem", marginBottom: "1rem" }}>
           <Suspense fallback="Loading...">
@@ -67,17 +86,19 @@ const Home: BlitzPage = () => {
         </div>
         <p>
           <strong>
-            To add a new model to your app, <br />
-            run the following in your terminal:
+            {t("home.paragraph.line1")}
+            <br />
+            {t("home.paragraph.line2")}
           </strong>
         </p>
         <pre>
-          <code>blitz generate all project name:string</code>
+          <code>{t("home.code")}</code>
         </pre>
-        <div style={{ marginBottom: "1rem" }}>(And select Yes to run prisma migrate)</div>
+        <div style={{ marginBottom: "1rem" }}>{t("home.parenthesis")}</div>
         <div>
           <p>
-            Then <strong>restart the server</strong>
+            {t("home.restart.part1")}
+            <strong>{t("home.restart.part2")}</strong>
           </p>
           <pre>
             <code>Ctrl + c</code>
@@ -86,9 +107,9 @@ const Home: BlitzPage = () => {
             <code>blitz dev</code>
           </pre>
           <p>
-            and go to{" "}
+            {t("home.goto")}{" "}
             <Link href="/projects">
-              <a>/projects</a>
+              <a>{t("home.project")}</a>
             </Link>
           </p>
         </div>
@@ -99,7 +120,7 @@ const Home: BlitzPage = () => {
             target="_blank"
             rel="noopener noreferrer"
           >
-            Documentation
+            {t("home.documentationLink")}
           </a>
           <a
             className="button-outline"
@@ -107,7 +128,7 @@ const Home: BlitzPage = () => {
             target="_blank"
             rel="noopener noreferrer"
           >
-            Github Repo
+            {t("home.githubLink")}
           </a>
           <a
             className="button-outline"
@@ -115,7 +136,7 @@ const Home: BlitzPage = () => {
             target="_blank"
             rel="noopener noreferrer"
           >
-            Discord Community
+            {t("home.discordLink")}
           </a>
         </div>
       </main>
@@ -126,7 +147,7 @@ const Home: BlitzPage = () => {
           target="_blank"
           rel="noopener noreferrer"
         >
-          Powered by Blitz.js
+          {t("home.footer")}
         </a>
       </footer>

@@ -269,4 +290,10 @@ const Home: BlitzPage = () => {
 Home.suppressFirstRenderFlicker = true
 Home.getLayout = (page) => <Layout title="Home">{page}</Layout>

+export const getStaticProps: GetStaticProps<I18nProps<MyLocale>> = async (context) => {
+  const locale = context.locale || context.defaultLocale
+  const { table = {} } = await import(`app/core/i18n/${locale}`) // Import locale
+  return { props: { table } } // Passed to `/pages/_app.tsx`
+}
+
 export default Home

```

Look also at the following files:
`app/auth/components/LoginForm.tsx`
`app/auth/pages/login.tsx`

## Start the dev server



```

yarn blitz dev

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
