export type Event<T> = {type: string; payload: T}

export const IDLE = 'IDLE'
export const INIT = 'INIT'
export const FILE_WRITTEN = 'FILE_WRITTEN'
export const FILE_COMPILED = 'FILE_COMPILED'
export const ERROR_THROWN = 'ERROR_THROWN'
export const READY = 'READY'
