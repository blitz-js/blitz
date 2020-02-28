import {Controller} from '@blitzjs/core'
import {validContent} from '../utils/contentFilter'

export const PostsController = Controller(({db}) => ({
  name: 'PostsController',

  permit: ['title', 'content'],

  async index() {
    const posts = await db.post.findMany({orderBy: {id: 'desc'}, first: 20})

    return {
      data: {posts},
    }
  },

  async show({id}) {
    const post = await db.post.findOne({where: {id}, include: {comments: true}})

    return {
      data: {post},
    }
  },

  async create(params, newData) {
    if (!validContent(newData.title)) {
      newData.title = 'Fruit'
    }
    if (!validContent(newData.content)) {
      newData.content = 'Fruit'
    }

    const data = await db.post.create({
      data: newData,
    })

    return {
      data,
      redirect: {
        href: '/posts/[id]',
        as: `/posts/${data.id}`,
      },
    }
  },

  async update(params, newData) {
    if (!validContent(newData.title)) {
      newData.title = 'Fruit'
    }
    if (!validContent(newData.content)) {
      newData.content = 'Fruit'
    }

    const data = await db.post.update({
      where: {id: params.id},
      data: newData,
    })

    return {
      data,
      redirect: {
        href: `/posts/[id]`,
        as: `/posts/${data.id}`,
      },
    }
  },

  async delete({id}) {
    // Have to delete comments because cascade delete doesn't work yet
    await db.comment.deleteMany({where: {post: {id}}})
    await db.post.delete({where: {id}})

    return {
      redirect: {
        href: '/posts',
      },
    }
  },
}))
