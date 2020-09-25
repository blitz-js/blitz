import previewEmail from "preview-email"
import {MailDriver} from "../mail"

export const previewDriver: MailDriver = () => ({
  send: ({from, ...options}) =>
    previewEmail({
      ...options,
      from: `"${from.name}" ${from.email}`,
    }),
})
