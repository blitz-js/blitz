[![Blitz.js](https://raw.githubusercontent.com/blitz-js/art/master/github-cover-photo.png)](https://blitzjs.com)

<!-- prettier-ignore-start -->
<p align="center">
  <a aria-label="Join our Discord Community" href="https://discord.blitzjs.com">
    <img alt="" src="https://img.shields.io/badge/Join%20our%20community-6700EB.svg?style=for-the-badge&labelColor=000000&logoWidth=20&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAQ9SURBVHgB7d3dVdtAEIbhcSpICUoH0IEogQqSVBBSAU4FSSpIOoAORAfQgSghHXzZ1U/YcMD4R9rZmf2ec3y448LyiNf27iLiGIAmPLrweC9Un3DhrzG6EarLNP09nlwJ1SOZ/lQr5N80/S/p2QMVCBf5N17XCfm1Y/rBHqjAG9PPHvBsz+mf9WAP+HLA9M/YA14cOP2payH7jpj+VCtk1wnTP+vj7xCy6cTpn7EHLMLp059iD1iD8eveJbVCNsSLheX1YA/YgOWnf8YeKB3Wmf7Ud6Fy4f/FHmtpxbl3YlC4MJ/Cj0bWdwPnPbARg+L0S54XQHS32WwuxClzd4CM0z9rPfeAuTtA5ulPXYQ7wZ04Y+oOoDD9KZc9YOoOoDj9s4dwFzgXR6w1wIPoOvPWA9buAHEJ173o3gWiy3AnuBUHLEbgmYwvAk1/wuM8vAgexThzbwPDkx7/DHwVXfFOxP2GmsKd4Ab6zPeAyU8CI7AHFmH2BRCBPXAyk18GzUrqAXCTiR4ssyj0VFw/oCU8+e+RZ33AWz6KMaYbIIWxB+JSLs1bsbkeMN0AqakHvoku9oA2sAfqBvbAQdw0QArsgb25aYBUQT3QgT2gB+yBuqGcHij2UCqXDZACe2Anlw2QYg/QAOyBuoE98CL3DZDCuK4/rh/Q7oGL6U+TOvcNkJoijN8X1C48+T+g75eQDrAH/qmqAVJgDwyqaoAUe4AGYA/UDZX3QLUNkEIZPRCd5+6BahsgVUgPROwBTSijB7jpVAvGHriHvmw9wAZ4BpX1ABvgmakHtPcbRuwBTWAPULgAV9D/jKDY9YRvwvgEaurD44uQHvAol7qBW7WKluVtIHiUS7GyvA0s6CiXDnxrpQfsgbqBS7GKk/2jYHCrVlGyfxTMrVo0ALdq1Q3sgSKofh0M9oA61a+D2QM0AHugbmAPqClmSRjK2apVVQ8UsySsoK1aHdgDesCtWnUDeyCrIpeFg1u3sylyWTi3btMA7IG6gT2wuuK3hoE9sKrit4YVslWLPaAN7IG6ocKt2zmY2h4O9sDiTG0PZw/QANy6XTewBxZj9ogYVHy025LMHhEz9cBn0We6B0yfERReBLfhx0/R1YQHPx/QBPbA0VwcEwf2wNFcHBPHHjiem3MC2QPHcXdSaJjA+KfgTPQ8hhfjBzHC40mhlzJ+Xq9lK4a4PCs43AVaGTed5mZq+iOXZwWHi3AnOj2wFWNcnxYe7gTxLtBKHuamP/J+Wnh8a5irB7ZC5Yk9gPX1QuXC+usHWqGyhYvUYR0a7zboUOFCNVhnk0krZAOW7wFOvzXhom2xnEbIHizTA1wEYhWW6YFGyC6c1gOcfg9wfA80Qj7g8B7g9HuCww+haIR8wf49wOn3Cvv9k8tGyC/s7gFOv3fY3QONkH+v9MBWqB7PeqDn9FcIT//kcitUn6kHOu/T/xfWzlQy3dEHhwAAAABJRU5ErkJggg==">
  </a>
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
<a aria-label="All Contributors" href="#contributors-"><img alt="" src="https://img.shields.io/badge/all_contributors-403-17BB8A.svg?style=for-the-badge&labelColor=000000"></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
  <a aria-label="License" href="https://github.com/blitz-js/blitz/blob/main/LICENSE">
    <img alt="" src="https://img.shields.io/npm/l/blitz.svg?style=for-the-badge&labelColor=000000&color=blue">
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@blitzjs/auth">
    <img alt="" src="https://img.shields.io/npm/v/blitz.svg?style=for-the-badge&labelColor=000000&color=E65528">
  </a>
</p>
<!-- prettier-ignore-end -->

<br>

<h1 align="center">
Blitz Auth - Framework Agnostic Authentication
</h1>

<br>

### [Documentation Link](https://blitzjs.com/docs/auth)

### [GitHub Link](https://github.com/blitz-js/blitz/tree/main/packages/blitz-auth)

### Quick Start

#### Install Blitz Auth

```bash
`npm i @blitzjs/auth`
# yarn add @blitzjs/auth
# pnpm add @blitzjs/auth
```

_You can alternatively use [`npx`](https://www.npmjs.com/package/npx)_

### Framework Support

Currently Blitz Auth usage is only documented with Next.js. We are working on adding additional support for other frameworks.

#### Setup Blitz Auth in Next.js

##### Client setup

Add the following to your blitz-client.ts file:

```ts
import {AuthClientPlugin} from "@blitzjs/auth"
import {setupBlitzClient} from "@blitzjs/next"

export const authConfig = {
  cookiePrefix: "testapp",
}

const {withBlitz} = setupBlitzClient({
  plugins: [AuthClientPlugin(authConfig)],
})

export {withBlitz}
```

##### Server setup

Then, add the following to the blitz-server.ts file:

```ts
import {setupBlitzServer} from "@blitzjs/next"
import {AuthServerPlugin, PrismaStorage, simpleRolesIsAuthorized} from "@blitzjs/auth"
import {db} from "db"
import {authConfig} from "./blitz-client"

const {gSSP, gSP, api} = setupBlitzServer({
  plugins: [
    AuthServerPlugin({
      ...authConfig,
      storage: PrismaStorage(db),
      isAuthorized: simpleRolesIsAuthorized,
    }),
  ],
})

export {gSSP, gSP, api}
```
