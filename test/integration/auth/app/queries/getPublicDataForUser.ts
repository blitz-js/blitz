import {Ctx, PublicData} from "blitz"
import db from "db"

type GetPublicDataProps = {
  userId: PublicData["userId"]
}
type Session = {
  userId: PublicData["userId"]
  sessionHandle: string
  publicData: string
}
export default async function getPublicDataForUser(
  {userId}: GetPublicDataProps,
  ctx: Ctx,
): Promise<PublicData[]> {
  return db
    .get("sessions")
    .filter({userId})
    .value()
    .map((session: Session) => JSON.parse(session.publicData))
}
