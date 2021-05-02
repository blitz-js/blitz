/* eslint-env jest */

import { join } from 'path'
import {
  killApp,
  findPort,
  launchApp,
  fetchViaHTTP,
  initNextServerScript,
} from 'next-test-utils'
import clone from 'clone'
import getPort from 'get-port'

jest.setTimeout(1000 * 60 * 2)
const appDir = join(__dirname, '../')
let appPort

let app
let server
jest.setTimeout(1000 * 60 * 2)

const context = {}

function runTests() {
  it('should parse JSON body', async () => {
    appPort = await findPort()
    app = await launchApp(appDir, appPort, {})
    const data = await makeRequest()
    expect(data).toEqual([{ title: 'Nextjs' }])
    killApp(app)
  })

  it('should not throw if request body is already parsed in custom middleware', async () => {
    await startServer()
    const data = await makeRequest()
    expect(data).toEqual([{ title: 'Nextjs' }])
    killApp(server)
  })
}

async function makeRequest() {
  const data = await fetchViaHTTP(appPort, '/api', null, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify([{ title: 'Nextjs' }]),
  }).then((res) => res.ok && res.json())

  return data
}

const startServer = async (optEnv = {}, opts) => {
  const scriptPath = join(appDir, 'server.js')
  context.appPort = appPort = await getPort()
  const env = Object.assign(
    {},
    clone(process.env),
    { PORT: `${appPort}` },
    optEnv
  )

  server = await initNextServerScript(
    scriptPath,
    /ready on/i,
    env,
    /ReferenceError: options is not defined/,
    opts
  )
}

runTests()
