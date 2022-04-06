// import { telefunc, telefuncConfig, provideTelefuncContext } from 'telefunc'
import getBasic from "app/queries/getBasic"

// telefuncConfig.telefuncUrl = "/api/_telefunc"

export default async function blitzRpc(req, res) {
  // const user = getUser(req)
  // provideTelefuncContext({ user })
  const {url, method, body} = req
  // const httpRequest = { url, method, body }
  // const httpResponse = await telefunc(httpRequest)
  // res.status(httpResponse.statusCode).send(httpResponse.body)

  getBasic(body, {})

  res.status(200).send("success")
}
