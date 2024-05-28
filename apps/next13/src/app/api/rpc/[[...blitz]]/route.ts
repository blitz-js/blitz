import {rpcAppHandler} from "@blitzjs/rpc"
import {blitzAuthAppContext} from "src/blitz-server"

export const {GET, POST, HEAD} = rpcAppHandler({}, blitzAuthAppContext)
