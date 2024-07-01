import {rpcAppHandler} from "@blitzjs/rpc"
import {withBlitzAuth} from "src/blitz-server"

export const {GET, POST, HEAD} = withBlitzAuth(rpcAppHandler())
