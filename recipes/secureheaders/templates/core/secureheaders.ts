import {BlitzScript, DocumentProps} from "blitz"
import crypto from "crypto"

export const cspHashOf = (text: string) => {
  const hash = crypto.createHash("sha256")
  hash.update(text)
  return `'sha256-${hash.digest("base64")}'`
}

export const computeCsp = (props: Readonly<DocumentProps>) => {
  const scriptHash = cspHashOf(BlitzScript.getInlineScriptSource(props))

  // You can remove `fonts.googleapis.com` and `fonts.gstatic.com` if you do not use Google fonts.
  return `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' data: fonts.gstatic.com; script-src 'self' ${
    process.env.NODE_ENV === "production" ? scriptHash : "'unsafe-eval' 'unsafe-inline'"
  }`
}
