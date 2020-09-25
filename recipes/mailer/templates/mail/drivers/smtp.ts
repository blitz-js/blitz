import nodemailer from "nodemailer"
import {MailDriver} from "../mail"

export const smtpDriver: MailDriver = () => {
  const mailTransport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  })

  return {
    send: ({from, ...options}) =>
      mailTransport.sendMail({
        ...options,
        from: `"${from.name}" ${from.email}`,
      }),
  }
}
