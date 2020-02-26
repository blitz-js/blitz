import {Controller} from '@blitzjs/core'
import {CommentCreateInput} from '@prisma/client'

export const CommentsController = Controller(({db}) => ({
  name: 'CommentsController',

  permit: ['content'],

  async create(params, newData) {
    const data = await db.comment.create({
      data: {
        ...(newData as Pick<CommentCreateInput, 'content'>),
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
