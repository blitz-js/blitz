import {pathExistsSync} from 'fs-extra'
import {resolve} from 'path'
import File from 'vinyl'

import {streams} from '@blitzjs/utils'
import {Rule} from '../../../types'

const isNextConfigPath = (p: string) => /next\.config\.(js|ts)/.test(p)
const isNowBuild = () => process.env.NOW_BUILDER || process.env.VERCEL_BUILDER
/**
 * Returns a Rule that manages converting from blitz.config.js to next.config.js
 */
const create: Rule = ({config, input}) => {
  // Preconditions
  const hasNextConfig = pathExistsSync(resolve(config.src, 'next.config.js'))
  const hasBlitzConfig = pathExistsSync(resolve(config.src, 'blitz.config.js'))

  if (hasNextConfig && !isNowBuild()) {
    // TODO: Pause the stream and ask the user if they wish to have their configuration file renamed
    const err = new Error(
      'Blitz does not support next.config.js. Please rename your next.config.js to blitz.config.js',
    )
    err.name = 'NextConfigSupportError'
    throw err
  }

  if (!hasBlitzConfig) {
    // Assume a bare blitz config
    input.write(
      new File({
        cwd: config.src,
        path: resolve(config.src, 'blitz.config.js'),
        contents: Buffer.from('module.exports = {};'),
      }),
    )
  }

  if (!hasNextConfig) {
    input.write(
      new File({
        cwd: config.src,
        path: resolve(config.src, 'next.config.js'),
        contents: Buffer.from(`
const {withBlitz} = require('@blitzjs/server');
const config = require('./blitz.config.js');
module.exports = withBlitz(config);
        `),
      }),
    )
  }

  // No need to filter yet
  const stream = streams.through({objectMode: true}, (file: File, _, next) => {
    if (!isNextConfigPath(file.path)) return next(null, file)
    // Zeit now adds configuration needed for Now, like serverless target,
    // so we need to keep and use that
    if (isNowBuild()) {
      // Assume we have a next.config.js if NOW_BUILDER is true as the cli creates one

      // Divert next.config to next-zeit.config.js
      input.write(
        new File({
          cwd: config.src,
          path: resolve(config.src, 'next-zeit.config.js'),
          contents: file.contents,
        }),
      )

      file.contents = Buffer.from(`
const {withBlitz} = require('@blitzjs/server');
const zeitConfig = require('./next-zeit.config.js');
const config = require('./blitz.config.js');
module.exports = withBlitz({...config, ...zeitConfig});
      `)
    }

    next(null, file)
  })

  return {stream}
}
export default create
