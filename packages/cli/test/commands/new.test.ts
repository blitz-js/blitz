import NewCmd from "../../src/commands/new";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import fetch from "node-fetch";
import nock from "nock";

nock("https://registry.npmjs.org")
  .persist()
  .get(() => true)
  .reply(408);

nock.restore();

async function getLatestBlitzVersion() {
  const response = await fetch("https://registry.npmjs.org/-/package/blitz/dist-tags");
  const { latest } = await response.json();
  return latest;
}

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

    async function withNewApp(test: (dirName: string, packageJson: any) => Promise<void> | void) {
      const tempDir = makeTempDir();
      await NewCmd.run([tempDir]);

      const packageJsonFile = fs.readFileSync(
        path.join(tempDir, "package.json"),
        { encoding: "utf8", flag: "r" }
      );
      const packageJson = JSON.parse(packageJsonFile);

      await test(tempDir, packageJson);

      fs.rmdirSync(tempDir);
    }

    it("pins Blitz to the current version", () => withNewApp(async (_, packageJson) => {
      const { dependencies: { blitz: blitzVersion } } = packageJson;

      expect(blitzVersion).toEqual(await getLatestBlitzVersion());
    }));

    describe("with network trouble", () => {
      it("uses template versions", async () => {
        nock.activate();
        await withNewApp((_, packageJson) => {
          const { dependencies } = packageJson;
          expect(dependencies.blitz).toBe("latest");
        })
        nock.restore();
      })
    });

  })
})