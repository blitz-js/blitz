import {PublicData, SessionConfigMethods, SessionModel} from "../../shared"

interface PrismaClientWithSession {
  session: {
    findFirst(args?: {where?: {handle?: SessionModel["handle"]}}): Promise<SessionModel | null>
    findMany(args?: {where?: {userId?: PublicData["userId"]}}): Promise<SessionModel[]>
    create(args: {
      data: SessionModel & {
        userId?: any
        user?: {connect: {id: any}}
      }
    }): Promise<SessionModel>
    update(args: {
      data: Partial<SessionModel>
      where: {handle?: SessionModel["handle"]}
    }): Promise<SessionModel>
    delete(args: {where: {handle?: SessionModel["handle"]}}): Promise<SessionModel>
  }
}

export const PrismaStorage = <Client extends PrismaClientWithSession>(
  db: Client,
): SessionConfigMethods => {
  return {
    getSession: (handle) => db.session.findFirst({where: {handle}}),
    getSessions: (userId) => db.session.findMany({where: {userId}}),
    createSession: (session) => {
      let user
      if (session.userId) {
        user = {connect: {id: session.userId}}
      }
      return db.session.create({
        data: {...session, userId: undefined, user},
      })
    },
    updateSession: async (handle, session) => {
      try {
        return await db.session.update({where: {handle}, data: session})
      } catch (error: any) {
        // Session doesn't exist in DB for some reason, so create it
        if (error.code === "P2016") {
          console.warn("Could not update session because it's not in the DB")
        } else {
          throw error
        }
      }
    },
    deleteSession: (handle) => db.session.delete({where: {handle}}),
  }
}
