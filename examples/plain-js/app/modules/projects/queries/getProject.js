import db from "db"
export default async function getProject(args) {
  const project = await db.project.findOne(args)
  return project
}
