import {transform} from './transform'
import File from 'vinyl'
import {relative, resolve} from 'path'

type PathTransformerOpts = {
  sourceFolder?: string
  appFolder: string
  folderName: string
}

export function createPathTransformer(opts: PathTransformerOpts) {
  return (path: string) => {
    const regex = new RegExp(`(?:\\/?${opts.appFolder}\\/.*?\\/)(${opts.folderName}\\/.+)$`)
    return (regex.exec(path) || [])[1] || path
  }
}

export function transformPage(opts: PathTransformerOpts) {
  const pathTransform = createPathTransformer(opts)
  return transform((file: File) => {
    file.path = resolve(opts.sourceFolder || '', pathTransform(relative(opts.sourceFolder || '', file.path)))
    return file
  })
}
