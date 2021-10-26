const BLITZ_PATH = "../blitz/bin/blitz"
const TEST_APP_NAME = "app"

// waiting 2 minutes for the command to execute or test breaks
const execConfig = {
  log: true,
  timeout: 120000,
}

const buildAppCommand = (
  appName: string = TEST_APP_NAME,
  packageManager: "yarn" | "npm",
  template: "full" | "minimal",
  formLib: "react-final-form" | "react-hook-form" | "formik",
  language: "typescript" | "javascript",
): void => {
  cy.exec(
    `${BLITZ_PATH} new ${appName} --${packageManager} --template=${template}  --form=${formLib} --language=${language}`,
    execConfig,
  )
  cy.writeFile(
    `./${TEST_APP_NAME}/types.ts`,
    "declare module 'react' { interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> { jsx?: boolean; global?: boolean }}",
    {encoding: "utf8", flag: "a+"},
  )

  cy.readFile("../blitz/package.json").then((packageJson) => {
    cy.exec(
      `cd ${appName} && ${packageManager} add blitz@${packageJson.dependencies["@blitzjs/cli"]} --save`,
    )
    cy.readFile(`./${appName}/package.json`).then((testAppPackageJson) => {
      expect(testAppPackageJson.dependencies["blitz"]).eqls(
        packageJson.dependencies["@blitzjs/cli"],
      )
    })
  })

  cy.exec(`cd ${appName};${packageManager};${packageManager} run build`, execConfig)
}

describe("blitz new command", () => {
  beforeEach(() => {
    cy.exec(`rimraf ${TEST_APP_NAME}`)
  })

  afterEach(() => {
    cy.exec(`rimraf ${TEST_APP_NAME}`)
  })

  it("Should create a new app", () => {
    buildAppCommand(TEST_APP_NAME, "yarn", "full", "react-hook-form", "typescript")
  })
})
