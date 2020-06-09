import * as fs from 'fs'
import path from 'path'

enum ResponseStatus {
  Success = 'ok',
  Error = 'error',
}

// type Status = 'ok' | 'error'

export type _File = {
  name: string
  isFolder: boolean
  isBlitzProject: boolean
  isRestricted: boolean
}

export type GetDirectoryResponse = {
  files: _File[]
  dir: string
  message?: string
  status: ResponseStatus
}

let dir: fs.Dir

async function createDirExplorer(path?: string): Promise<fs.Dir> {
  const _path = path || __dirname

  return await fs.promises.opendir(_path)
}

async function checkIfBlitzProject(path: string): Promise<boolean> {
  let isBlitz: boolean = false

  const dir: fs.Dir = await fs.promises.opendir(path)

  for await (const dirent of dir) {
    if (
      (dirent.isFile() && dirent.name === 'blitz.config.js') ||
      (dirent.isDirectory() && dirent.name === '.blitz')
    ) {
      isBlitz = true
      break
    }
  }

  return isBlitz
}

export default async function getDirectory(
  toRead?: string,
): Promise<GetDirectoryResponse> {
  try {
    const dir = await createDirExplorer(toRead)

    let files: _File[] = []

    for await (const dirent of dir) {
      let file: _File
      try {
        file = {
          name: dirent.name,
          isFolder: dirent.isDirectory(),
          isBlitzProject:
            dirent.isDirectory() &&
            (await checkIfBlitzProject(path.join(dir.path, dirent.name))),
          isRestricted: false,
        }
      } catch (e) {
        file = {
          name: dirent.name,
          isFolder: dirent.isDirectory(),
          isBlitzProject: false,
          isRestricted: false,
        }
      }

      files.push(file)
    }

    return {
      dir: dir.path,
      files,
      status: ResponseStatus.Success,
    }
  } catch (e) {
    return {
      dir: 'none',
      files: [],
      message: e.toString(),
      status: ResponseStatus.Error,
    }
  }
}
