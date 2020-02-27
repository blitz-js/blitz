import * as fixtures from './controller-fixtures'

describe('controller', () => {
  const createContext = (opts: any = {}) => ({
    query: {},
    ...opts,
    req: {method: 'GET', url: '/', socket: {remoteAddress: 'testAddress'}, ...opts.req},
    res: {status: jest.fn(), ...opts.res},
  })

  const createSimpleRequest = (ctx: any) => fixtures.unstable_getSimpleServerProps(ctx)
  const createRedirectRequest = (ctx: any) => fixtures.unstable_getRedirectServerProps(ctx)

  it('simple index response', async () => {
    const ctx = createContext()
    const returning = (await createSimpleRequest(ctx)) as {props: any}
    expect(returning.props).toMatchObject({message: 'indexed'})
    expect(ctx.res.status).toBeCalledWith(200)
  })

  it('simple show response', async () => {
    const ctx = createContext({query: {id: 123}})
    const returning = (await createSimpleRequest(ctx)) as {props: any}
    expect(returning.props).toMatchObject({message: 'shown'})
    expect(ctx.res.status).toBeCalledWith(200)
  })

  it('simple create response', async () => {
    const ctx = createContext({req: {method: 'POST'}})
    const returning = (await createSimpleRequest(ctx)) as {props: any}
    expect(returning.props).toMatchObject({message: 'created'})
  })

  it('simple update response', async () => {
    const ctx = createContext({req: {method: 'PATCH'}})
    const returning = (await createSimpleRequest(ctx)) as {props: any}
    expect(returning.props).toMatchObject({message: 'updated'})
  })

  it('simple delete response', async () => {
    const ctx = createContext({req: {method: 'DELETE'}})
    await createSimpleRequest(ctx)
    expect(ctx.res.status).toBeCalledWith(204)
  })

  it('simple head response', async () => {
    const ctx = createContext({
      req: {method: 'HEAD'},
      res: {status: jest.fn().mockImplementation(() => ctx.res), end: jest.fn()},
    })
    await createSimpleRequest(ctx)
    expect(ctx.res.status).toBeCalledWith(204)
    expect(ctx.res.end).toBeCalled()
  })

  it('simple unknown response', async () => {
    const ctx = createContext({req: {method: 'UNKNOWN'}, res: {status: jest.fn(), end: jest.fn()}})
    await createSimpleRequest(ctx)
    expect(ctx.res.status).toBeCalledWith(404)
  })

  it('simple api response', async () => {
    const ctx = createContext({req: {url: '/api/simple'}, res: {status: jest.fn(), json: jest.fn()}})
    await createSimpleRequest(ctx)
    expect(ctx.res.json).toBeCalledWith({message: 'indexed'})
    expect(ctx.res.status).toBeCalledWith(200)
  })

  it('redirect response', async () => {
    const ctx = createContext({req: {method: 'POST'}, res: {setHeader: jest.fn(), end: jest.fn()}})
    await createRedirectRequest(ctx)

    expect(ctx.res.setHeader).toBeCalledWith('Location', 'href')
    expect(ctx.res.setHeader).toBeCalledWith('x-as', 'as')
  })
})
