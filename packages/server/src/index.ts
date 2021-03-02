export {withBlitz} from "./with-blitz"
export {build} from "./build"
export {dev} from "./dev"
export {prod} from "./prod"
export {routes} from "./routes"
export {normalize} from "./config"
export type {ServerConfig} from "./config"
export {resolveBinAsync} from "./resolve-bin-async"
export {ManifestLoader} from "./stages/manifest"
export * from "./rpc"

// -----------------
// For custom server
// -----------------
import next from "next"

// Support commonjs `require('blitz')`
if (process.env.BLITZ_PROD_BUILD) {
  module.exports = next
  exports = module.exports
}

// eslint-disable-next-line import/no-default-export
export default next
