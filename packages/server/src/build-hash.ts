import {hashElement} from 'folder-hash'
import {pathExists, readFile, writeFile} from 'fs-extra'
import {resolve, relative} from 'path'

export async function getInputArtefactsHash(buildFolder: string = '.blitz/caches') {
  const options = {
    algo: 'md5',
    folders: {exclude: ['node_modules', relative(process.cwd(), buildFolder), '.blitz', 'cypress', '.next']},
  }
  const tree = await hashElement('.', options)
  return tree.hash
}

export async function alreadyBuilt(buildFolder: string = '.blitz/caches') {
  const hashStore = resolve(buildFolder, 'last-build')
  if (!(await pathExists(hashStore))) {
    return false
  }
  try {
    const buffer = await readFile(hashStore)
    const hash = await getInputArtefactsHash(buildFolder)
    const read = buffer.toString().replace('\n', '')
    process.stdout.write(JSON.stringify({read, hash}) + '\n')
    return read === hash
  } catch (err) {
    // process.stdout.write('there was an error\n')
    return false
  }
}

export async function saveBuild(buildFolder: string = '.blitz/caches') {
  const hashStore = resolve(buildFolder, 'last-build')
  const hash = await getInputArtefactsHash(buildFolder)
  await writeFile(hashStore, hash)
}
