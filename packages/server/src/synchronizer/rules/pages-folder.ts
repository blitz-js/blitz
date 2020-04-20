import File from 'vinyl'
import {absolutePathTransform} from './path-utils'
import {Rule} from '../types'

type Args = {
  srcPath?: string
  appFolder?: string
  folderName?: string | string[]
}

export default function pagesFolder(opts: Args): Rule {
  const filePathTransformer = absolutePathTransform(opts.srcPath)
  const pagesPathTransformer = filePathTransformer(createPagesPathTransformer(opts))
  return (file: File, _encoding?: string) => {
    file.path = pagesPathTransformer(file.path)
    return file
  }
}

const ensureArray = (a: any) => (Array.isArray(a) ? a : [a])
export function createPagesPathTransformer(opts: Args) {
  const {appFolder = 'app', folderName = ['routes', 'pages']} = opts

  const folderNameRegex = `(?:${ensureArray(folderName).join('|')})`
  return (path: string) => {
    const regex = new RegExp(`(?:\\/?${appFolder}\\/.*?\\/?)(${folderNameRegex}\\/.+)$`)
    const subPath = (regex.exec(path) || [])[1] || path
    const pagesPath = subPath.replace(new RegExp(folderNameRegex), 'pages')
    return pagesPath
  }
}
