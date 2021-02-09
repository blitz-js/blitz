import path from "path"
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

// Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
path.resolve("next.config.js")
path.resolve("blitz.config.js")
path.resolve(".next/blitz/db.js")
// End anti-tree-shaking
