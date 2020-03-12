declare module '@prisma/client' {
  export class PrismaClient {
    constructor(args: any)
  }
}

export * from './identity'
export * from './model'
export * from './action'
export * from './controller'
