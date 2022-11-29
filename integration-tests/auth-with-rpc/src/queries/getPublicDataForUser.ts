import {Ctx} from "blitz"
import db from "../../db"

export default async function getPublicDataForUser({userId}: any, ctx: Ctx) {
  return (
    db
      //@ts-ignore
      .get("sessions")
      .filter({userId})
      .value()
      .map((session: any) => JSON.parse(session.publicData))
  )
}
