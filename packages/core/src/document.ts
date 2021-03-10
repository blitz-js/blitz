/*
 * IF YOU CHANGE THIS FILE
 *    You also need to update the rewrite map in
 *    packages/babel-preset/src/rewrite-imports.ts
 */
export {default as Document, Head as DocumentHead, Html, Main} from "next/document"
export type {DocumentProps, DocumentContext, DocumentInitialProps} from "next/document"
export {BlitzScript} from "./blitz-script"
