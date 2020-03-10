const {PrismaClient} = require('@prisma/client')
const db = new PrismaClient()

const clear = async () => {
  await db.connect()
  await db.comment.deleteMany({})
  await db.post.deleteMany({})
  return null
}

const addPost = async (post) => {
  await db.connect()
  return db.post.create({data: post})
}

const addComment = async ({post, content}) => {
  await db.connect()
  return db.comment.create({data: {post: {connect: {id: post.id}}, content}})
}

module.exports = {
  clear,
  addPost,
  addComment
}
