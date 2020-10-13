import {pathExistsSync} from "fs-extra"
import {resolve} from "path"
import File from "vinyl"
import {transformFileSync as babelTransform} from "@babel/core"

import {transform} from "@blitzjs/file-pipeline"
import {Stage} from "@blitzjs/file-pipeline"

const isNextConfigPath = (p: string) => /next\.config\.(js|ts)/.test(p)
const isBlitzTsConfigPath = (p: string) => /blitz\.config\.ts/.test(p)
const isNowBuild = () => process.env.NOW_BUILDER || process.env.VERCEL_BUILDER
/**
 * Returns a Stage that manages converting from blitz.config.js to next.config.js
 */
export const createStageConfig: Stage = ({config, processNewFile, processNewChildFile}) => {
  // Preconditions
  const hasNextConfig = pathExistsSync(resolve(config.src, "next.config.js"))
  const hasBlitzConfig = pathExistsSync(resolve(config.src, "blitz.config.js"))
  const hasBlitzTsConfig = pathExistsSync(resolve(config.src, "blitz.config.ts"))

  if (hasNextConfig && !isNowBuild()) {
    // TODO: Pause the stream and ask the user if they wish to have their configuration file renamed
    const err = new Error(
      "Blitz does not support next.config.js. Please rename your next.config.js to blitz.config.js",
    )
    err.name = "NextConfigSupportError"
    throw err
  }

  if (!hasBlitzConfig && !hasBlitzTsConfig) {
    // Assume a bare blitz config
    processNewFile(
      new File({
        cwd: config.src,
        path: resolve(config.src, "blitz.config.js"),
        contents: Buffer.from("module.exports = {};"),
      }),
    )
  }

  if (!hasNextConfig) {
    processNewFile(
      new File({
        cwd: config.src,
        path: resolve(config.src, "next.config.js"),
        contents: Buffer.from(`
const {withBlitz} = require('@blitzjs/server');
const config = require('./blitz.config.js');
module.exports = withBlitz(config);
        `),
      }),
    )
  }

  // No need to filter yet
  const stream = transform.file((file) => {
    if (isBlitzTsConfigPath(file.path)) {
      const result = babelTransform(resolve(config.src, "blitz.config.ts"))

      if (!result || !result.code) {
        throw new Error("Blitz was unable to transpile your blitz.config.ts file")
      }

      processNewChildFile({
        parent: file,
        child: new File({
          cwd: config.src,
          path: resolve(config.src, "blitz.config.js"),
          contents: Buffer.from(result.code),
        }),
        stageId: "config",
        subfileId: "blitz-config-js",
      })
    }

    if (!isNextConfigPath(file.path)) return file

    // File is next.config.js

    // Vercel now adds configuration needed for Now, like serverless target,
    // so we need to keep and use that
    if (isNowBuild()) {
      // Assume we have a next.config.js if NOW_BUILDER is true as the cli creates one

      // Divert next.config to next-vercel.config.js
      processNewChildFile({
        parent: file,
        child: new File({
          cwd: config.src,
          path: resolve(config.src, "next-vercel.config.js"),
          contents: file.contents,
        }),
        stageId: "config",
        subfileId: "vercel-config",
      })

      file.contents = Buffer.from(`
const {withBlitz} = require('@blitzjs/server');
const vercelConfig = require('./next-vercel.config.js');
const config = require('./blitz.config.js');
module.exports = withBlitz({...config, ...vercelConfig});
      `)
    }

    return file
  })

  return {stream}
}
