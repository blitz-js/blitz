import sgMail from "@sendgrid/mail"
import {MailDriver} from "../mail"

export const sendgridDriver: MailDriver = () => {
  sgMail.setApiKey(process.env.MAIL_SENDGRID_KEY!)

  return sgMail
}
