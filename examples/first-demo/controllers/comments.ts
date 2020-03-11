import {Controller} from '@blitzjs/core'
import {validContent} from '../utils/contentFilter'

export const CommentsController = Controller(({db}) => ({
  name: 'CommentsController',

  permit: ['content'],

  async create(params, newData) {
    if (!validContent(newData.content)) {
      newData.content = 'Fruit'
    }

    const data = await db.comment.create({
      // @ts-ignore TODO: fix type issues
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
