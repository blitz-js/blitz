import db from "db"
export default async function getProjects(args) {
  const projects = await db.project.findMany(args)
  return projects
}
