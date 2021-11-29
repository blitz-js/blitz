import {spawn} from "cross-spawn"
import {mocked} from "ts-jest/utils"
import * as RunCommandExecutor from "../../src/executors/run-command-executor"

jest.mock("cross-spawn")

describe("run command executor", () => {
  const cliTest1: RunCommandExecutor.Config = {
    stepId: "runCommand",
    stepName: "Run Command Test 1",
    stepType: "run-command",
    explanation: "This step will run a command for testing purposes",
    command: {
      command: "ls",
      commandArgs: ["-a", "-l"],
    },
  }

  const cliTest2: RunCommandExecutor.Config = {
    stepId: "runCommand",
    stepName: "Run Command Test 2",
    stepType: "run-command",
    explanation: "This step will run a command for testing purposes",
    command: {
      command: "npx",
      commandArgs: [
        "create-app",
        "example-app",
        "--use-npm",
        "--example",
        '"https://github.com/vercel/next-learn/tree/master/basics/learn-starter"',
      ],
    },
  }

  const cliTest3: RunCommandExecutor.Config = {
    stepId: "runCommand",
    stepName: "Run Command Test 3",
    stepType: "run-command",
    explanation: "This step will run a command for testing purposes",
    command: {
      command: "ls",
    },
  }

  const cliTest4: RunCommandExecutor.Config = {
    stepId: "runCommand",
    stepName: "Run Command Test 4",
    stepType: "run-command",
    explanation: "This step will run a command for testing purposes",
    command: {
      command: "ls",
      commandArgs: [],
    },
  }

  it("runs testcase 1 - simple ls", async () => {
    const mockedSpawn = mockSpawn()
    mocked(spawn).mockImplementation(mockedSpawn.spawn as any)
    await RunCommandExecutor.executeCommand(cliTest1.command.command, cliTest1.command.commandArgs)
    expect(mockedSpawn.calls[0]).toEqual("ls -a -l")
  })

  it("runs testcase 2 - npx create-app with double quotes", async () => {
    const mockedSpawn = mockSpawn()
    mocked(spawn).mockImplementation(mockedSpawn.spawn as any)
    await RunCommandExecutor.executeCommand(cliTest2.command.command, cliTest2.command.commandArgs)
    expect(mockedSpawn.calls[0]).toEqual(
      'npx create-app example-app --use-npm --example "https://github.com/vercel/next-learn/tree/master/basics/learn-starter"',
    )
  })

  it("runs testcase 3 - command without args", async () => {
    const mockedSpawn = mockSpawn()
    mocked(spawn).mockImplementation(mockedSpawn.spawn as any)
    await RunCommandExecutor.executeCommand(cliTest3.command.command, cliTest3.command.commandArgs)
    expect(mockedSpawn.calls[0]).toEqual("ls ")
  })

  it("runs testcase 4 - command with empty args", async () => {
    const mockedSpawn = mockSpawn()
    mocked(spawn).mockImplementation(mockedSpawn.spawn as any)
    await RunCommandExecutor.executeCommand(cliTest4.command.command, cliTest4.command.commandArgs)
    expect(mockedSpawn.calls[0]).toEqual("ls ")
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
