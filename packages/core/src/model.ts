import {PromiseReturnType} from '@prisma/client'
import {UserContext} from '../types/identity'

type PrismaDelegate = {
  findOne: (...args: any) => Promise<any>
  findMany: (...args: any) => Promise<any>
  create: (...args: any) => Promise<any>
  upsert: (...args: any) => Promise<any>
  update: (...args: any) => Promise<any>
  updateMany: (...args: any) => Promise<any>
  delete: (...args: any) => Promise<any>
  deleteMany: (...args: any) => Promise<any>
  count: (...args: any) => Promise<any>
}

type CrudOp = 'read' | 'create' | 'update' | 'delete'

export type AuthorizationInput<M> = {
  user: UserContext
  op: CrudOp
  data: M
}

type AuthFn<M> = (context: AuthorizationInput<M>) => boolean

type GetModel<D extends PrismaDelegate> = NonNullable<PromiseReturnType<D['findOne']>>

export type BlitzModelConfig<D extends PrismaDelegate> = {
  delegate?: D
  // validate: (data: GetModel<D>) => any
  validate: any
  authorize: AuthFn<GetModel<D>>
  fields?: {
    [name: string]: (data: GetModel<D>) => any
  }
}

export type BlitzModel<D extends PrismaDelegate> = D & {
  user: (user: UserContext) => BlitzModel<D>
  authorize: AuthFn<GetModel<D>>
  validate: any
}

// interface WrappedDb<D extends PrismaDelegate, A> {
//   findOne: (...args: Parameters<D['findOne']>) => Promise<(PromiseReturnType<D['findOne']> & A) | null>
// }

function addComputedFields<D extends PrismaDelegate>(config: BlitzModelConfig<D>, result: any) {
  return Object.assign(
    {},
    result,
    ...Object.entries(config.fields || {}).map(([field, fieldFn]) => ({[field]: fieldFn(result)})),
  )
}
function authorize<D extends PrismaDelegate>(
  config: BlitzModelConfig<D>,
  result: any,
  op: CrudOp,
  user?: UserContext,
) {
  return config.authorize({data: result, op, user: user || {id: null, roles: []}})
}

export function model<D extends PrismaDelegate>(config: BlitzModelConfig<D>) {
  const handler = {
    get(target: any, propKey: string) {
      const originalFn = target[propKey]

      if (propKey === 'user') {
        return (userContext: UserContext) => {
          target._userContext = userContext
          return new Proxy(target, handler)
        }
      } else if (propKey === 'findOne') {
        return async function(...args: any[]) {
          let result = await originalFn.apply(this, args)
          if (authorize<D>(config, result, 'read', target._userContext)) {
            return addComputedFields<D>(config, result)
          } else {
            throw new Error('Unauthorized')
          }
        }
      } else if (propKey === 'findMany') {
        return async function(...args: any[]) {
          let results = await originalFn.apply(this, args)
          return results.map((result: any) => {
            if (authorize<D>(config, result, 'read', target._userContext)) {
              return addComputedFields<D>(config, result)
            } else {
              throw new Error('Unauthorized')
            }
          })
        }
      } else if (propKey === 'count') {
        return async function(...args: any[]) {
          if (authorize<D>(config, args[0].data, 'read', target._userContext)) {
            return await originalFn.apply(this, args)
          } else {
            throw new Error('Unauthorized')
          }
        }
      } else if (propKey === 'create') {
        return async function(...args: any[]) {
          if (authorize<D>(config, args[0].data, 'create', target._userContext)) {
            // validate throws error if invalid
            await config.validate.validate(args[0].data)
            let result = await originalFn.apply(this, args)
            return addComputedFields<D>(config, result)
          } else {
            throw new Error('Unauthorized')
          }
        }
      } else if (propKey === 'upsert') {
        return async function(...args: any[]) {
          if (authorize<D>(config, args[0].data, 'create', target._userContext)) {
            // TODO: how to validate here
            return await originalFn.apply(this, args)
          } else {
            throw new Error('Unauthorized')
          }
        }
      } else if (propKey === 'update') {
        return async function(...args: any[]) {
          if (authorize<D>(config, args[0].data, 'update', target._userContext)) {
            // validate throws error if invalid
            await config.validate.validate(args[0].data)
            let result = await originalFn.apply(this, args)
            return addComputedFields<D>(config, result)
          } else {
            throw new Error('Unauthorized')
          }
        }
      } else if (propKey === 'updateMany') {
        return async function(...args: any[]) {
          if (authorize<D>(config, args[0].data, 'update', target._userContext)) {
            // TODO: how to validate here
            return await originalFn.apply(this, args)
          } else {
            throw new Error('Unauthorized')
          }
        }
      } else if (propKey === 'delete') {
        return async function(...args: any[]) {
          if (authorize<D>(config, args[0].data, 'delete', target._userContext)) {
            return await originalFn.apply(this, args)
          } else {
            throw new Error('Unauthorized')
          }
        }
      } else if (propKey === 'deleteMany') {
        return async function(...args: any[]) {
          if (authorize<D>(config, args[0].data, 'delete', target._userContext)) {
            return await originalFn.apply(this, args)
          } else {
            throw new Error('Unauthorized')
          }
        }
      } else {
        return originalFn
      }
    },
  }

  return new Proxy(
    {...config.delegate, ...config, validate: config.validate.validate},
    handler,
  ) as BlitzModel<D>
}
