import {RecipeBuilder} from "@blitzjs/installer"
import {join} from "path"

export default RecipeBuilder()
  .setName("Mailer")
  .setDescription("This recipe will add a multi-driver mailing system.")
  .setOwner("alex@sandulat.com")
  .setRepoLink("https://github.com/blitz-js/blitz")
  // .addAddDependenciesStep({
  //   stepId: "addDeps",
  //   stepName: "Add npm dependencies",
  //   explanation: `This mailing system relies on a couple of dependencies. Handlebars will be installed as the templating engine. SendGrid, Nodemailer and Preview Email will be installed as mail drivers.`,
  //   packages: [
  //     {name: "handlebars", version: "4.7.6"},
  //     {name: "@sendgrid/mail", version: "7.2.6"},
  //     {name: "nodemailer", version: "6.4.11"},
  //     {name: "preview-email", version: "2.0.2"},
  //     {name: "@types/handlebars", version: "4.1.0", isDevDep: true},
  //     {name: "@types/nodemailer", version: "6.4.0", isDevDep: true},
  //     {name: "@types/preview-email", version: "2.0.0", isDevDep: true},
  //   ],
  // })
  .addNewFilesStep({
    stepId: "addMailer",
    stepName: "Add the mailing system and all its drivers",
    explanation: `We are simply copying the mailing system into your app. Feel free to extend it with your own drivers.`,
    targetDirectory: "./mail",
    templatePath: join(__dirname, "templates/mail"),
    templateValues: {},
  })
  .addNewFilesStep({
    stepId: "addUsageExample",
    stepName: "Add an example of mailing system usage",
    explanation: `We will add a mailing system usage example.`,
    targetDirectory: "./app/mail-example",
    templatePath: join(__dirname, "templates", "mail-example"),
    templateValues: {},
  })
  .addNewFilesStep({
    stepId: "addEnvExample",
    stepName: "Add an example of environment variables",
    explanation: `We will add an environment configuration example, which will contain all the necessary variables for the mailing system to work. Do not forget to move these variables into your own .env and delete this example file.`,
    targetDirectory: ".",
    templatePath: join(__dirname, "templates", "config"),
    templateValues: {},
  })
  .build()
