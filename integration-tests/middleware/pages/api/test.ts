import {api} from "../../app/blitz-server"

export default api((_req, res) => {
  res.status(200).json({success: true})
})
