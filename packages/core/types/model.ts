import {ActionInput} from './action'

export type ValidationResult = {
  valid: boolean
  errors: Array<{field: string; message: string}>
}

export type ModelOperation = 'create' | 'read' | 'update' | 'delete'

export interface ModelDefinition<A, M, U> {
  model: (attrs: A) => Readonly<M>
  authorize: (op: ModelOperation, input: ActionInput) => boolean
  validate: (attrs: U) => ValidationResult
}
