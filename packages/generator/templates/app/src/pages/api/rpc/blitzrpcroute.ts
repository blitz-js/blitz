import { rpcHandler } from "@blitzjs/rpc"
import { api } from "src/app/blitz-server"

export default api(rpcHandler({ onError: console.log }))
