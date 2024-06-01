import {rpcAppHandler} from "@blitzjs/rpc"
import {blitzAuthRpcMiddleware} from "src/blitz-server"

export const {GET, POST, HEAD} = rpcAppHandler({}, blitzAuthRpcMiddleware)
