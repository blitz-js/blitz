import {model, v} from '@blitzjs/core'
import db from 'prisma/db'
// todo: can we configure TS so that prisma client types are always in scope?
export * from '@prisma/client'

export const Product = model({
  // delegate is optional for non-persisted models
  delegate: db.product,
  validate: v`{
    name: string               :: "Name must be a string"
          & string[>3]         :: "Name must be longer than 3 characters",
  }`,
  // todo: add DSL for authorization
  authorize: ({user, op, data}) => (op === 'read' ? true : user.roles.includes('admin')),
  fields: {
    displaySlug: ({name}) => name?.toLowerCase().replace(' ', '-'),
  },
})
