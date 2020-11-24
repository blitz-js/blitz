module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  coverageReporters: ["json", "lcov", "text", "clover"],
  // collectCoverage: !!`Boolean(process.env.CI)`,
  collectCoverageFrom: ["src/**/*.ts"],
  coveragePathIgnorePatterns: ["/templates/"],
  modulePathIgnorePatterns: ["<rootDir>/tmp", "<rootDir>/dist"],
  // TODO enable threshold
  // coverageThreshold: {
  //   global: {
  //     branches: 100,
  //     functions: 100,
  //     lines: 100,
  //     statements: 100,
  //   },
  // },
}
