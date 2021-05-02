import { webpack } from 'next/dist/compiled/webpack/webpack'
import { NextConfig } from '../../../next-server/server/config'
import { base } from './blocks/base'
import { css } from './blocks/css'
import { ConfigurationContext, pipe } from './utils'

export async function build(
  config: webpack.Configuration,
  {
    rootDirectory,
    customAppFile,
    isDevelopment,
    isServer,
    assetPrefix,
    sassOptions,
    productionBrowserSourceMaps,
    future,
  }: {
    rootDirectory: string
    customAppFile: string | null
    isDevelopment: boolean
    isServer: boolean
    assetPrefix: string
    sassOptions: any
    productionBrowserSourceMaps: boolean
    future: NextConfig['future']
  }
): Promise<webpack.Configuration> {
  const ctx: ConfigurationContext = {
    rootDirectory,
    customAppFile,
    isDevelopment,
    isProduction: !isDevelopment,
    isServer,
    isClient: !isServer,
    assetPrefix: assetPrefix
      ? assetPrefix.endsWith('/')
        ? assetPrefix.slice(0, -1)
        : assetPrefix
      : '',
    sassOptions,
    productionBrowserSourceMaps,
    future,
  }

  const fn = pipe(base(ctx), css(ctx))
  return fn(config)
}
