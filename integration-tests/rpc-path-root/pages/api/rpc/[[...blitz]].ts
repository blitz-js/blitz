import {rpcHandler} from "@blitzjs/rpc"

export default rpcHandler({onError: (error, ctx) => console.log(error)})
