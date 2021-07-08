// @ts-check
import { invokeWithMiddleware } from 'next/stdlib-server'
import * as getBasic from '../queries/getBasic'

export default async function (req, res) {
  const result = await invokeWithMiddleware(getBasic, null, { req, res })
  res.send(result)
}
