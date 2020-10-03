import db from "db"
export default async function deleteProject(args) {
  const project = await db.project.delete(args)
  return project
}
