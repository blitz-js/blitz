import {rpcHandler} from "@blitzjs/rpc"
import {api} from "../../../blitz-server"

export default api(rpcHandler({onError: (error, ctx) => console.log(error)}))
