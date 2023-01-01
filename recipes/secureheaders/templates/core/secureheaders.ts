import {NextScript, DocumentProps} from "next/document"
import crypto from "crypto"

export const cspHashOf = (text: string) => {
  const hash = crypto.createHash("sha256")
  hash.update(text)
  return `'sha256-${hash.digest("base64")}'`
}

export const computeCsp = (props: Readonly<DocumentProps>) => {
  const scriptHash = cspHashOf(NextScript.getInlineScriptSource(props))

  return `default-src 'self'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' data: fonts.gstatic.com; script-src 'self' ${
    process.env.NODE_ENV === "production" ? "" : "'unsafe-eval'"
  } ${scriptHash}`
}
