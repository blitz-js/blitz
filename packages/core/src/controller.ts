import {PrismaClient} from '@prisma/client'
import {NextApiRequest, NextApiResponse} from 'next'
import permit from 'permit-params'
import prettyMs from 'pretty-ms'
import {ControllerInput, ControllerInstance} from '../types/controller'
import {isServer} from './utils'

export {default as Form} from './components/Form'

let db: PrismaClient
if (isServer) {
  db = new PrismaClient({log: ['info', 'query']})
  // const Client = eval("require('@prisma/client')").PrismaClient
  // db = new Client({log: ['info', 'query']})
  // Go ahead and connect to the DB so that HEAD requests can warm the lambda and db connection
  db.connect()
}

const actionNotFound = () => ({
  status: 404,
  data: {},
})

export function Controller(getController: ControllerInput) {
  const controller = getController({db})
  return {
    name: controller.name,
    permit: controller.permit || [],
    index: controller.index || actionNotFound,
    show: controller.show || actionNotFound,
    create: controller.create || actionNotFound,
    update: controller.update || actionNotFound,
    delete: controller.delete || actionNotFound,
  } as ControllerInstance
}

export const harnessServerProps = (Controller: ControllerInstance) => (ctx: any) => {
  return harnessController(Controller)({...ctx.req, query: ctx.query}, ctx.res)
}

export const harnessController = (Controller: ControllerInstance) => async (
  req: NextApiRequest & {url: any},
  res: NextApiResponse,
) => {
  const startTime = new Date().getTime()
  console.log('')
  console.log(
    `Started ${req.method} "${req.url}" for ${req.socket?.remoteAddress || 'unknown'} at ${new Date()}`,
  )

  const stringId = req.query && (Array.isArray(req.query.id) ? req.query.id[0] : req.query.id)
  delete req.query.id
  const id = isNaN(parseInt(stringId)) ? null : parseInt(stringId)

  const params = {id, query: req.query}
  const data = req.body || {}

  console.log(`  params: ${JSON.stringify(params)}`)
  console.log(`  data: ${JSON.stringify(data)}`)

  let result: Record<any, any> = {}
  if (req.method === 'GET' && id) {
    console.log(`  Processing by ${Controller.name}.show`)
    result = await Controller.show(params, permit(data, ...Controller.permit))
  } else if (req.method === 'GET') {
    console.log(`  Processing by ${Controller.name}.index`)
    result = await Controller.index(params, permit(data, ...Controller.permit))
  } else if (req.method === 'POST') {
    console.log(`  Processing by ${Controller.name}.create`)
    result = await Controller.create(params, permit(data, ...Controller.permit))
  } else if (req.method === 'PATCH') {
    console.log(`  Processing by ${Controller.name}.update`)
    result = await Controller.update(params, permit(data, ...Controller.permit))
  } else if (req.method === 'DELETE') {
    console.log(`  Processing by ${Controller.name}.delete`)
    result = await Controller.delete(params, permit(data, ...Controller.permit))
  } else if (req.method === 'HEAD') {
    // This is used to warm the lamba before it's actually needed
    return res.status(204).end()
  } else {
    res.status(404)
  }

  if (result?.redirect) {
    res.setHeader('Location', result.redirect.href)
    if (result.redirect.as) {
      res.setHeader('x-as', result.redirect.as)
    }
  }
  if (result?.status) {
    res.status(result.status)
  }

  if (result?.data) {
    if (req.url.includes('/api/')) {
      res.json(result.data)
    } else {
      const returning = {props: result.data}
      const duration = prettyMs(new Date().getTime() - startTime)
      console.log(`  Returning to page after ${duration}: ${JSON.stringify(returning)}`)
      console.log(' ')
      return returning
    }
  } else {
    res.end()
  }
  const duration = prettyMs(new Date().getTime() - startTime)
  console.log(`Completed ${res.statusCode} ${res.statusMessage} in ${duration}`)
  console.log(' ')
}

// type PageControllerAction = "index" | "show"
//
// type Await<T> = T extends {
//   then(onfulfilled?: (value: infer U) => unknown): unknown
// }
//   ? U
//   : T
//
// // export const harnessPage = (action: ControllerActionWithRequiredData) => {
// export const harnessPage = (controller: ControllerInstance) => {
//   // type PageProps = Await<ReturnType<typeof action>>
//   // type ThisControllerResponse = Await<ReturnType<typeof action>>
//   // type PageProps = ThisControllerResponse["data"]
//
//   // return (page: NextPage<PageProps>) => {
//   return (page: NextPage<any>) => {
//     const Page = page
//
//     // ;(Page as any).unstable_getServerProps = harnessController(controller)
//
//     return Page
//   }
// }
