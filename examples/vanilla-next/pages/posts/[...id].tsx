import {greet} from 'app/posts/controller'
import {Form} from '@blitzjs/core'

// TEST: Importing and using a thing from core should not spit the dummy
console.log(Form.name)

// TEST: Typical server rendering from params example
export const unstable_getServerProps = (ctx: any) => {
  const {res} = ctx

  const stringId = ctx.query && (Array.isArray(ctx.query.id) ? ctx.query.id[0] : ctx.query.id)

  const id = isNaN(parseInt(stringId)) ? null : parseInt(stringId)

  if (res?.status) res?.status(200)
  return Promise.resolve({props: {id}})
}

export default function Page({id}) {
  return <h1>{greet(`${id}`)}</h1>
}
