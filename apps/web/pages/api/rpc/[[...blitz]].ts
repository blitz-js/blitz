import {handleRpcRequest} from "@blitzjs/rpc"
import {api} from "src/server-setup"
// telefuncConfig.telefuncUrl = "/api/_telefunc"

export default api(async function blitzRpc(req, res) {
  // const user = getUser(req)
  // provideTelefuncContext({ user })
  // const httpRequest = { url, method, body }
  // const httpResponse = await telefunc(httpRequest)
  // res.status(httpResponse.statusCode).send(httpResponse.body)

  await handleRpcRequest(req, res)

  res.status(200).send("success")
})
