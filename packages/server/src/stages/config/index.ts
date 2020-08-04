import {pathExistsSync} from "fs-extra"
import {resolve} from "path"
import File from "vinyl"

import {transform} from "@blitzjs/file-pipeline"
import {Stage} from "@blitzjs/file-pipeline"

const isNextConfigPath = (p: string) => /next\.config\.(js|ts)/.test(p)
const isNowBuild = () => process.env.NOW_BUILDER || process.env.VERCEL_BUILDER

/**
 * Returns a Stage that manages converting from blitz.config.js to next.config.js
 */
export const createStageConfig: Stage = ({config, input}) => {
  // Preconditions
  const hasNextConfig = pathExistsSync(resolve(config.src, "next.config.js"))
  const hasBlitzConfig = pathExistsSync(resolve(config.src, "blitz.config.js"))

  if (hasNextConfig) {
    // TODO: Pause the stream and ask the user if they wish to have their configuration file renamed
    const err = new Error(
      "Blitz does not support next.config.js. Please rename your next.config.js to blitz.config.js",
    )
    err.name = "NextConfigSupportError"
    throw err
  }

  if (!hasBlitzConfig) {
    // Assume a bare blitz config
    input.write(
      new File({
        cwd: config.src,
        path: resolve(config.src, "blitz.config.js"),
        contents: Buffer.from("module.exports = {};"),
      }),
    )
  }

  input.write(
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

  // No need to filter yet
  const stream = transform.file((file) => {
    if (!isNextConfigPath(file.path)) return file
    // Vercel now adds configuration needed for Now, like serverless target,
    // so we need to keep and use that
    if (isNowBuild()) {
      // Assume we have a next.config.js if NOW_BUILDER is true as the cli creates one

      // Divert next.config to next-vercel.config.js
      input.write(
        new File({
          cwd: config.src,
          path: resolve(config.src, "next-vercel.config.js"),
          contents: file.contents,
        }),
      )

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
