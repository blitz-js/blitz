import File from 'vinyl'
import {Readable, Transform} from 'readable-stream'
import {transform} from './transform'

function getStream() {
  const stream = new Readable({objectMode: true})
  stream._read = () => {}
  return stream
}

function getCollector(output: any[]) {
  const stream = new Transform({objectMode: true})

  return stream.on('data', (data: File) => {
    output.push(data)
  })
}

it('transforms the file', () => {
  const stream = getStream()
  const output: File[] = []
  const collector = getCollector(output)

  stream
    .pipe(
      transform((file) => {
        return [file, new File({path: file.path + '_rpc', contents: file.contents})]
      }),
    )
    .pipe(collector)

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
})
