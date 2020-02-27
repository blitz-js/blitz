import {Controller} from '@blitzjs/core'
import alex from 'alex'

export const PostsController = Controller(({db}) => ({
  name: 'PostsController',

  permit: ['title', 'content'],

  async index() {
    const posts = await db.post.findMany({orderBy: {id: 'asc'}})

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
    if (alex(newData.title).messages.length || newData.title?.toLowerCase().includes('4chan')) {
      newData.title = 'Be nice'
    }
    if (alex(newData.content).messages.length || newData.content?.toLowerCase().includes('4chan')) {
      newData.content = 'Be nice'
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
    if (alex(newData.title).messages.length || newData.title?.toLowerCase().includes('4chan')) {
      newData.title = 'Be nice'
    }
    if (alex(newData.content).messages.length || newData.content?.toLowerCase().includes('4chan')) {
      newData.content = 'Be nice'
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
