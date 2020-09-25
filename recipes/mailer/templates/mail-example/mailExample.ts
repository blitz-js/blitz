import {mail} from "mail/mail"

export const mailExample = () =>
  mail.send({
    subject: "Something cool",
    to: "email@example.org",
    view: "mail-example/template-example",
    variables: {foo: "bar"},
  })
