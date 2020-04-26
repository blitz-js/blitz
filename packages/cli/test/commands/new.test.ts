import NewCmd from "../../src/commands/new";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
const cliPackageJson = require("../../package");

function makeTempDir() {
  const tmpDirPath = path.join(
    os.tmpdir(),
    "blitzjs-test-"
  );

  return fs.mkdtempSync(tmpDirPath);
}

describe("`new` command", () => {
  describe("when scaffolding new project", () => {

    jest.setTimeout(60 * 1000);

    let tempDir: string;
    beforeAll(async () => {
      tempDir = makeTempDir();
      await NewCmd.run([tempDir]);
    });

    afterAll(() => {
      fs.rmdirSync(tempDir);
    });

    it("pins Blitz to the current version", () => {
      const packageJsonFile = fs.readFileSync(
        path.join(tempDir, "package.json"),
        { encoding: "utf8", flag: "r" }
      );
      const packageJson = JSON.parse(packageJsonFile);
      const { dependencies: { blitz: blitzVersion } } = packageJson;
      expect(blitzVersion).toEqual(cliPackageJson.version);
    });

  })
})