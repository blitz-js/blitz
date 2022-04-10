import {rpcHandler} from "@blitzjs/rpc"
import {api} from "src/server-setup"

export default api(rpcHandler({onError: console.log}))
