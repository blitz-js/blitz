import {model, v} from '@blitzjs/core'
import db, {ProductDelegate} from 'prisma/db'

export const Product = model<ProductDelegate>({
  delegate: db.product,
  validate: v`{
    name: string               :: "Name must be a string"
          & string[>3]         :: "Name must be longer than 3 characters",
  }`,
  authorize: ({user, op, data}) => (op === 'read' ? true : user.roles.includes('admin')),
  fields: {
    displaySlug: ({name}) => name?.toLowerCase().replace(' ', '-'),
  },
})
