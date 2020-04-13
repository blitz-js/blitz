import File from 'vinyl'
import {Readable, Writable} from 'readable-stream'
import {fileDecorator} from './pipeline'

function getReadable() {
  const stream = new Readable({
    objectMode: true,
  })
  stream._read = () => {}

  return stream
}

function getCollector(write: (data: any) => void) {
  const stream = new Writable({
    objectMode: true,
  })

  stream._write = (data, _, cb) => {
    write(data)
    cb()
  }

  return stream
}

it('transforms the file', (done) => {
  const stream = getReadable()
  const output: File[] = []
  const collector = getCollector((data) => output.push(data))

  stream.push(
    new File({
      path: '/folder/file1',
      contents: Buffer.from('File 1'),
    }),
  )
  stream.push(
    new File({
      path: '/folder/file2',
      contents: Buffer.from('File 2'),
    }),
  )
  stream.push(
    new File({
      path: '/folder/file3',
      contents: Buffer.from('File 3'),
    }),
  )

  stream.push(null)

  stream
    .pipe(
      fileDecorator((file) => {
        return [file, new File({path: file.path + '_rpc', contents: file.contents})]
      }),
    )
    .pipe(collector)

  stream.on('end', () => {
    expect(
      output.map(({path, contents}) => ({
        path,
        contents: contents?.toString(),
      })),
    ).toMatchObject([
      {
        path: '/folder/file1',
        contents: 'File 1',
      },
      {
        path: '/folder/file1_rpc',
        contents: 'File 1',
      },
      {
        path: '/folder/file2',
        contents: 'File 2',
      },
      {
        path: '/folder/file2_rpc',
        contents: 'File 2',
      },
      {
        path: '/folder/file3',
        contents: 'File 3',
      },
      {
        path: '/folder/file3_rpc',
        contents: 'File 3',
      },
    ])
    done()
  })
})
