import db from "db"
export default async function updateProject(args) {
  // Don't allow updating ID
  delete args.data.id
  const project = await db.project.update(args)
  return project
}
