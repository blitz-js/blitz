declare module '@prisma/client' {
  export class PrismaClient {
    constructor(args: any)
  }
}

export * from './controller'
export * from './action'
export * from './identity'
