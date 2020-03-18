import {ActionInput} from './action'
import {ValidationFn} from './validation'

export type ModelOperation = 'create' | 'read' | 'update' | 'delete'

export interface ModelDefinition<A, M, U> {
  model: (data: A) => Readonly<M>
  authorize: (op: ModelOperation, input: ActionInput) => boolean
  validate: ValidationFn<U>
}
