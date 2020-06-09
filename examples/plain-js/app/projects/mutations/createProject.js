import db from "db"
export default async function createProject(args) {
  const project = await db.project.create(args)
  return project
}
