describe("It should build the project", () => {
  it("App build", () => {
    cy.exec("rimraf -rf app")
    cy.exec(
      `../blitz/bin/blitz new app --template=full --yarn --form=react-final-form --language=typescript`,
      {
        log: true,
        timeout: 120000,
      },
    )
    cy.exec(`../blitz/bin/blitz -v`, {log: true, timeout: 120000})
    cy.exec(
      `echo "declare module 'react' { interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> { jsx?: boolean; global?: boolean }}" >> app/types.ts`,
    )
    cy.exec("export NODE_TLS_REJECT_UNAUTHORIZED=1;cd app;yarn;yarn run build", {
      log: true,
      timeout: 120000,
    })
  })
})
