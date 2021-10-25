const BLITZ_PATH = "../blitz/bin/blitz"
const testAppFolderName = "app"

// waiting 2 minutes for the command to execute or test breaks
const execConfig = {
  log: true,
  timeout: 120000,
}

const buildAppCommand = (
  appName: string,
  packageManager: "yarn" | "npm",
  template: "full" | "minimal",
  formLib: "react-final-form" | "react-hook-form" | "formik",
  language: "typescript" | "javascript",
): void => {
  cy.exec(
    `${BLITZ_PATH} new ${appName} --${packageManager} --template=${template}  --form=${formLib} --language=${language}`,
    execConfig,
  )
  cy.exec("node ./test/e2e/cypress/integration/helpers/append-file.js")

  cy.exec(`node ./test/e2e/cypress/integration/helpers/blitz-cli-version.js`).then((version) => {
    cy.exec(`cd app && ${packageManager} add blitz@${version.stdout} --save`)

    cy.exec(`node ./test/e2e/cypress/integration/helpers/blitz-cli-version.js`).then(
      (versionTest) => {
        expect(version.stdout).eqls(versionTest.stdout)
      },
    )
  })

  cy.exec(
    `export NODE_TLS_REJECT_UNAUTHORIZED=1;cd ${appName};${packageManager};${packageManager} run build`,
    execConfig,
  )
}

describe("blitz new command", () => {
  beforeEach(() => {
    cy.exec(`rimraf ${testAppFolderName}`)
  })

  afterEach(() => {
    cy.exec(`rimraf ${testAppFolderName}`)
  })

  it("Should create a new app", () => {
    buildAppCommand(testAppFolderName, "yarn", "full", "react-hook-form", "typescript")
  })
})
