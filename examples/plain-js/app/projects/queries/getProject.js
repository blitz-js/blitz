import db from "db"
export default async function getProject(args) {
  const project = await db.project.findFirst(args)
  return project
}
