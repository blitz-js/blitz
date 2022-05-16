
import {gSSP} from "app/blitz-server"
import getUsers from "app/queries/getUsers"

export const getServerSideProps = gSSP(async ({ctx}) => {
  await ctx.prefetchBlitzQuery(getUsers, {})

  return {props: {}}
})
