import pages from './pages'
import rpc from './rpc'
// import config from './blitz-config'
import {Readable} from 'readable-stream'
import {rulesPipeline} from './pipeline'

type Config = {
  srcPath: string
  destPath: string
  errorHandler: (a: any) => void
}

export default function applyFileStreamRules({errorHandler, ...cfg}: Config) {
  // prettier-ignore
  const pipeline = [
    pages(cfg), 
    rpc(cfg), 
    // config(cfg)
  ]

  return (stream: Readable) => rulesPipeline(pipeline, errorHandler)(stream)
}
