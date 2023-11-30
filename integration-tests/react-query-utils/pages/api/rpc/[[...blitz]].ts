import {rpcHandler} from "@blitzjs/rpc"
import {api} from "../../../app/blitz-server"

export default api(rpcHandler({onError: (error, ctx) => console.log(error)}))
