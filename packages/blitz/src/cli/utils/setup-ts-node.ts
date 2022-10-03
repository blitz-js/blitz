import {REGISTER_INSTANCE} from "ts-node"

export const setupTsnode = () => {
  if (!process[REGISTER_INSTANCE]) {
    // During blitz interal dev, oclif automaticaly sets up ts-node so we have to check
    require("ts-node").register({compilerOptions: {module: "commonjs"}})
  }
  require("tsconfig-paths/register")
}
