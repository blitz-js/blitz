import {pathExistsSync} from "fs-extra"
import {resolve} from "path"
import File from "vinyl"
import bundle from "@vercel/ncc"

import {transform} from "@blitzjs/file-pipeline"
import {Stage} from "@blitzjs/file-pipeline"

const isNextConfigPath = (p: string) => /next\.config\.(js|ts)/.test(p)
const isBlitzTsConfigPath = (p: string) => /blitz\.config\.ts/.test(p)
const isNowBuild = () => process.env.NOW_BUILDER || process.env.VERCEL_BUILDER

const nextConfigSupportError = (msg: string): Error => {
  const err = new Error(msg)
  err.name = "NextConfigSupportError"
  return err
}

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
    throw nextConfigSupportError(
      "Blitz does not support next.config.js. Please rename your next.config.js to blitz.config.js",
    )
  }

  if (hasBlitzConfig && hasBlitzTsConfig) {
    throw nextConfigSupportError(
      "Blitz has found blitz.config.js and blitz.config.ts. Please delete one of these configuration files.",
    )
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
module.exports = withBlitz(config.default ? config.default : config);
        `),
      }),
    )
  }

  // No need to filter yet
  const stream = transform.file(async (file) => {
    if (isBlitzTsConfigPath(file.path)) {
      const res = await bundle(file.path, {
        quiet: true,
        externals: ["@blitzjs/server", "@next/bundle-analyzer"], // FIXME: Figure out why this wouldn't work? Do we need to bundle everything?
      })

      file.path = resolve(config.src, "blitz.config.js")
      file.contents = Buffer.from(res.code)

      return file
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
module.exports = withBlitz({...(config.default ? config.default : config), ...vercelConfig});
      `)
    }

    return file
  })

  return {stream}
}
