import {spawn} from "cross-spawn"
import {existsSync} from "fs-extra"
import {mocked} from "ts-jest/utils"
import * as AddDependencyExecutor from "../../src/executors/add-dependency-executor"

jest.mock("fs-extra")
jest.mock("cross-spawn")

describe("add dependency executor", () => {
  const testConfiguration = {
    stepId: "addDependencies",
    stepName: "Add dependencies",
    stepType: "add-dependency",
    explanation: "This step will add some dependencies for testing purposes",
    packages: [{name: "typescript", version: "4"}, {name: "ts-node"}],
  }

  it("should properly identify executor", () => {
    const wrongConfiguration = {
      stepId: "wrongStep",
      stepName: "Wrong Step",
      stepType: "wrong-type",
      explanation: "This step is wrong",
    }
    expect(AddDependencyExecutor.isAddDependencyExecutor(wrongConfiguration)).toBeFalsy()
    expect(AddDependencyExecutor.isAddDependencyExecutor(testConfiguration)).toBeTruthy()
  })

  it("should choose proper package manager according to lock file", () => {
    mocked(existsSync).mockReturnValueOnce(true)
    expect(AddDependencyExecutor.getPackageManager()).toEqual("npm")
    expect(AddDependencyExecutor.getPackageManager()).toEqual("yarn")
  })

  it("should issue proper commands according to the specified packages", async () => {
    const mockedSpawn = mockSpawn()
    mocked(spawn).mockImplementation(mockedSpawn.spawn as any)

    // NPM
    mocked(existsSync).mockReturnValue(true)
    await AddDependencyExecutor.installPackages(testConfiguration.packages, true)
    await AddDependencyExecutor.installPackages(testConfiguration.packages, false)

    // Yarn
    mocked(existsSync).mockReturnValue(false)
    await AddDependencyExecutor.installPackages(testConfiguration.packages, true)
    await AddDependencyExecutor.installPackages(testConfiguration.packages, false)

    expect(mockedSpawn.calls.length).toEqual(4)
    expect(mockedSpawn.calls[0]).toEqual("npm add --save-dev typescript@4 ts-node")
    expect(mockedSpawn.calls[1]).toEqual("npm add typescript@4 ts-node")
    expect(mockedSpawn.calls[2]).toEqual("yarn add -D typescript@4 ts-node")
    expect(mockedSpawn.calls[3]).toEqual("yarn add typescript@4 ts-node")
  })
})

/**
 * Primitive mock of spawn function
 */
const mockSpawn = () => {
  let calls: string[] = []

  return {
    spawn: (command: string, args: string[], _: unknown = {}) => {
      calls.push(`${command} ${args.join(" ")}`)

      return {
        on: (_: string, resolve: () => void) => resolve(),
      }
    },
    calls,
  }
}
