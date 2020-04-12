import {transform} from '../transform'
import File from 'vinyl'
import {relative, resolve} from 'path'

type PathTransformerOpts = {
  sourceFolder?: string
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
  const pathTransform = createPathTransformer(opts)
  return transform((file: File) => {
    const {sourceFolder = ''} = opts
    const startingPath = relative(sourceFolder, file.path)
    const transformedPath = pathTransform(startingPath)
    const absolutePath = resolve(sourceFolder, transformedPath)
    file.path = absolutePath
    return file
  })
}
