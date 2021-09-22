declare module "hasbin"

// I have no idea why we have to include this. I think bug in next.js:
// check https://github.com/vercel/next.js/issues/21390
declare namespace webpack {
  export type Compiler = any
  export type Plugin = any
}
declare module "next/dist/compiled/webpack/webpack" {
  export const webpack: any
}

declare module "global-agent"
