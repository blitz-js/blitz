import {transform} from '../transform'
import File from 'vinyl'
import {absolutePathTransform} from '../path-utils'

type PathTransformerOpts = {
  srcPath?: string
  appFolder: string
  folderName: string | string[]
}

const ensureArray = (a: any) => (Array.isArray(a) ? a : [a])
export function createPathTransformer(opts: PathTransformerOpts) {
  const folderNameRegex = `(?:${ensureArray(opts.folderName).join('|')})`
  return (path: string) => {
    const regex = new RegExp(`(?:\\/?${opts.appFolder}\\/.*?\\/?)(${folderNameRegex}\\/.+)$`)
    const subPath = (regex.exec(path) || [])[1] || path
    const pagesPath = subPath.replace(new RegExp(folderNameRegex), 'pages')
    return pagesPath
  }
}

export function createPagesFolderRule(opts: PathTransformerOpts) {
  const pagesPathTransformer = absolutePathTransform(opts.srcPath, createPathTransformer(opts))

  return transform((file: File) => {
    file.path = pagesPathTransformer(file.path)
    return file
  })
}
