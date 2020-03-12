import {ActionInput} from './action'

export type ValidationResult = {
  valid: boolean
  errors: Array<{field: string; message: string}>
}

export type ModelOperation = 'create' | 'read' | 'update' | 'delete'

export interface ModelDefinition<T, C> {
  model: (attrs: T) => Readonly<C>
  authorize: (op: ModelOperation, input: ActionInput) => boolean
  validate: (attrs: T) => ValidationResult
}
