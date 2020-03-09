import {PrismaClient} from '@prisma/client'

export interface ControllerParams extends Record<any, any> {
  id: number | string | null
  query: Record<any, any>
}

export interface ControllerResponse {
  data?: Record<any, any>
  redirect?: {
    href: string
    as?: string
  }
}
export interface ControllerResponseWithRequiredData extends ControllerResponse {
  data: Record<any, any>
}

export type ControllerInput = (args: {db: PrismaClient}) => ControllerDefinition

export type ControllerAction = (
  params: ControllerParams,
  data: Record<any, any>,
) => Promise<ControllerResponse>
export type ControllerActionWithRequiredData = (
  params: ControllerParams,
  data: Record<any, any>,
) => Promise<ControllerResponseWithRequiredData>

export interface ControllerDefinition {
  name: string
  permit?: Array<any>
  index?: ControllerActionWithRequiredData
  show?: ControllerActionWithRequiredData
  create?: ControllerAction
  update?: ControllerAction
  delete?: ControllerAction
}

export interface ControllerInstance {
  name: string
  permit: Array<any>
  index: ControllerActionWithRequiredData
  show: ControllerActionWithRequiredData
  create: ControllerAction
  update: ControllerAction
  delete: ControllerAction
}
