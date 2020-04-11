import {greet} from 'app/posts/controller'

// TEST: Typical server rendering from params example
export const getServerSideProps = (ctx: any) => {
  const {res} = ctx

  const stringId = ctx.query && (Array.isArray(ctx.query.id) ? ctx.query.id[0] : ctx.query.id)

  const id = isNaN(parseInt(stringId)) ? null : parseInt(stringId)

  if (res?.status) res?.status(200)
  return Promise.resolve({props: {id}})
}

export default function Page({id}) {
  return <h1>{greet(`${id}`)}</h1>
}
