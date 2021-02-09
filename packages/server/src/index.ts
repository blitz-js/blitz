export {withBlitz} from "./with-blitz"
export {build} from "./build"
export {dev} from "./dev"
export {prod} from "./prod"
export {routes} from "./routes"
export {normalize, ServerConfig} from "./config"
export {resolveBinAsync} from "./resolve-bin-async"
export {ManifestLoader} from "./manifest-loader"
export * from "./rpc"
export * from "./supertokens"

// -----------------
// For custom server
// -----------------
import next from "next"

// Support commonjs `require('blitz')`
module.exports = next
exports = module.exports

// eslint-disable-next-line import/no-default-export
export default next
