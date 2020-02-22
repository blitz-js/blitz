import {NextApiRequest, NextApiResponse} from 'next'
import {PrismaClient} from '@prisma/client'
import prettyMs from 'pretty-ms'
import permit from 'permit-params'
import {isBrowser} from './utils'

let db: PrismaClient
if (!isBrowser) {
  db = new PrismaClient({log: ['info', 'query']})
}

export {default as Form} from './Form'

interface ControllerParams extends Record<any, any> {
  id: number | null
  query: Record<any, any>
}

interface ControllerResponse {
  data?: Record<any, any>
  redirect?: {
    href: string
    as?: string
  }
}
interface ControllerResponseWithRequiredData extends ControllerResponse {
  data: Record<any, any>
}

type ControllerInput = (args: {db: PrismaClient}) => ControllerDefinition

type ControllerAction = (params: ControllerParams, data: Record<any, any>) => Promise<ControllerResponse>
type ControllerActionWithRequiredData = (
  params: ControllerParams,
  data: Record<any, any>
) => Promise<ControllerResponseWithRequiredData>

interface ControllerDefinition {
  name: string
  permit?: Array<any>
  index?: ControllerActionWithRequiredData
  show?: ControllerActionWithRequiredData
  create?: ControllerAction
  update?: ControllerAction
  delete?: ControllerAction
}

interface ControllerInstance {
  name: string
  permit?: Array<any>
  index: ControllerActionWithRequiredData
  show: ControllerActionWithRequiredData
  create: ControllerAction
  update: ControllerAction
  delete: ControllerAction
}

export function Controller(getController: ControllerInput) {
  const controller = getController({db})
  return {
    name: controller.name,
    permit: controller.permit,
    index: controller.index,
    show: controller.show,
    create: controller.create,
    update: controller.update,
    delete: controller.delete,
  } as ControllerInstance
}

export const harnessServerProps = (Controller: ControllerInstance) => (ctx: any) => {
  return harnessController(Controller)({...ctx.req, query: ctx.query}, ctx.res)
}

export const harnessController = (Controller: ControllerInstance) => async (
  req: NextApiRequest & {url: any},
  res: NextApiResponse
) => {
  const startTime = new Date().getTime()
  console.log('')
  console.log(`Started ${req.method} "${req.url}" for ${req.connection.remoteAddress} at ${new Date()}`)

  const stringId = req.query && (Array.isArray(req.query.id) ? req.query.id[0] : req.query.id)
  delete req.query.id
  const id = isNaN(parseInt(stringId)) ? null : parseInt(stringId)

  const params = {id, query: req.query}
  const data = req.body

  console.log(`  params: ${JSON.stringify(params)}`)
  console.log(`  data: ${JSON.stringify(data)}`)

  let result: Record<any, any> = {}
  if (req.method === 'GET' && id) {
    console.log(`  Processing by ${Controller.name}.show`)
    result = await Controller.show(params, permit(data))
  } else if (req.method === 'GET') {
    console.log(`  Processing by ${Controller.name}.index`)
    result = await Controller.index(params, permit(data))
  } else if (req.method === 'POST') {
    console.log(`  Processing by ${Controller.name}.create`)
    result = await Controller.create(params, permit(data))
  } else if (req.method === 'PATCH') {
    console.log(`  Processing by ${Controller.name}.update`)
    result = await Controller.update(params, permit(data))
  } else if (req.method === 'DELETE') {
    console.log(`  Processing by ${Controller.name}.delete`)
    result = await Controller.delete(params, permit(data))
  } else if (req.method === 'HEAD') {
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

export const sum = (a: number, b: number) => {
  if ('development' === process.env.NODE_ENV) {
    console.log('boop')
  }
  return a + b
}
