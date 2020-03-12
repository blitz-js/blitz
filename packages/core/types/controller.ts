import {PrismaClient} from '@prisma/client'
import {EntityId} from './identity'

export interface ControllerParams extends Record<any, any> {
  id: EntityId
  query: Record<any, any>
}

export interface ControllerResponse {
  data?: Record<any, any>
  redirect?: {
    href: string
    as?: string
  }
}

export type ControllerInput = (args: {db: PrismaClient}) => ControllerDefinition

export type ControllerAction = (
  params: ControllerParams,
  data: Record<any, any>,
) => Promise<ControllerResponse>

export interface ControllerDefinition {
  name: string
  permit?: Array<any>
  index?: ControllerAction
  show?: ControllerAction
  create?: ControllerAction
  update?: ControllerAction
  delete?: ControllerAction
}

export interface ControllerInstance {
  name: string
  permit: Array<any>
  index: ControllerAction
  show: ControllerAction
  create: ControllerAction
  update: ControllerAction
  delete: ControllerAction
}
