describe("It should build the project", () => {
  it("App build", () => {
    const packageManager = "yarn"
    cy.exec("rimraf -rf app")
    cy.exec(
      `../blitz/bin/blitz new app --template=full --${packageManager} --form=react-final-form --language=typescript`,
      {
        log: true,
        timeout: 120000,
      },
    )
    cy.exec(`../blitz/bin/blitz -v`, {log: true, timeout: 120000})

    cy.exec(`node ./test/e2e/cypress/integration/helpers/blitz-cli-version.js`).then((version) => {
      cy.exec(`cd app && ${packageManager} add blitz@${version.stdout} --save`)
      cy.exec(`node ./test/e2e/cypress/integration/helpers/blitz-cli-version.js`).then(
        (versionTest) => {
          expect(version.stdout).eqls(versionTest.stdout)
        },
      )
    })

    cy.exec("node ./test/e2e/cypress/integration/helpers/append-file.js")
    cy.exec(
      `export NODE_TLS_REJECT_UNAUTHORIZED=1;cd app;${packageManager};${packageManager} run build`,
      {
        log: true,
        timeout: 120000,
      },
    )
    cy.exec("rimraf -rf app")
  })
})
