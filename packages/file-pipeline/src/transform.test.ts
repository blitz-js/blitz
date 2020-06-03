import {transform} from './transform'
import {testStreamItems} from './test-utils'
import {PipelineItem} from 'types'
import {isFile, isEvent} from './utils'
import File from 'vinyl'
import through2 from 'through2'
describe('transform', () => {
  describe('when it uses the files filter', () => {
    const newFile = (path: string) => new File({event: 'add', path})
    const logger = (i: PipelineItem) => {
      if (isEvent(i)) {
        return i
      }
      if (isFile(i)) {
        const {path, event} = i
        return {path, event}
      }
      return i
    }

    it('should pass events', async () => {
      const s = transform.file((f) => f)
      s.write('one')
      s.write('two')
      s.write('three')
      await testStreamItems(s, ['one', 'two', 'three'], logger)
    })

    it('should pass files', async () => {
      const s = transform.file((f) => f)

      s.write(newFile('/one'))
      s.write(newFile('/two'))
      s.write(newFile('/three'))

      await testStreamItems(
        s,
        [
          {path: '/one', event: 'add'},
          {path: '/two', event: 'add'},
          {path: '/three', event: 'add'},
        ],
        logger,
      )
    })

    it('should swallow stuff when it doesnt return anything', async () => {
      const s = transform.file((_, {next}) => next())
      const l: any[] = []
      s.pipe(
        through2.obj((f, _, next) => {
          l.push(f)
          next(f)
        }),
      )
      s.write(newFile('/one'))
      s.write(newFile('/two'))
      s.write(newFile('/three'))

      expect(l).toEqual([])
    })

    it('should allow events through even when it is swallowing files', async () => {
      const s = transform.file((_, {next}) => next())
      s.write('one')
      s.write('two')
      s.write('three')
      await testStreamItems(s, ['one', 'two', 'three'], logger)
    })

    it('can push multiple events to the queue', async () => {
      const s = transform.file((_, {push}) => {
        push('a')
        push('b')
        return 'c'
      })
      s.write(newFile('one'))
      s.write('foo')
      await testStreamItems(s, ['a', 'b', 'c', 'foo'], logger)
    })

    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

    it('can handle a promise fn', async () => {
      const s = transform.file(async (f, {push}) => {
        push(f.path)
        push('b')
        await sleep(30)
        return 'c'
      })
      s.write('foo')
      s.write(newFile('a'))
      await testStreamItems(s, ['foo', 'a', 'b', 'c'], logger)
    })

    it('will only run the fn if the input is a file', async () => {
      const fn = jest.fn((f) => f)
      const s = transform.file(fn)
      s.write(newFile('one'))
      s.write(newFile('two'))
      s.write(newFile('three'))
      s.write('a')
      s.write('b')
      await testStreamItems(
        s,
        [{path: 'one', event: 'add'}, {path: 'two', event: 'add'}, {path: 'three', event: 'add'}, 'a', 'b'],
        logger,
      )
      expect(fn.mock.calls.length).toBe(3)
    })
  })

  it('should throw errors when they are returned', (done) => {
    const s = transform((f) => {
      if (isEvent(f) && f === 'throw') {
        return new Error('boop')
      }
      return f
    })

    s.on('error', (err) => {
      expect(err.message).toBe('boop')
      done()
    })

    s.write('one')
    s.write('throw')
  })

  it('should have reasonable defaults', () => {
    const s = transform()
    expect(s.readableHighWaterMark).toBe(16)
    expect(s.writableHighWaterMark).toBe(16)
    expect(s.readableObjectMode).toBe(true)
    expect(s.writableObjectMode).toBe(true)
  })
})
