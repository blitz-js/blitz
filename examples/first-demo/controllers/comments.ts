import {Controller} from '@blitzjs/core'
import alex from 'alex'

export const CommentsController = Controller(({db}) => ({
  name: 'CommentsController',

  permit: ['content'],

  async create(params, newData) {
    if (alex(newData.content).messages.length || newData.content?.toLowerCase().includes('4chan')) {
      newData.content = 'Be nice'
    }

    const data = await db.comment.create({
      data: {
        ...newData,
        post: {
          connect: {id: parseInt(params.query.postId)},
        },
      },
    })

    return {
      data,
      redirect: {
        href: '/posts/[id]',
        as: `/posts/${params.query.postId}`,
      },
    }
  },

  async delete({id}) {
    const data = await db.comment.delete({where: {id}, include: {post: true}})

    return {
      redirect: {
        href: '/posts/[id]',
        as: `/posts/${data.post.id}`,
      },
    }
  },
}))
