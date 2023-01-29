import {api} from "../../../blitz-server"

export default api((req, res, ctx) => {
  // console.log("session", ctx.session)
  //get cookie
  console.dir("cookie", req.headers.cookie)
  res.json({session: ctx.session.userId})
})
