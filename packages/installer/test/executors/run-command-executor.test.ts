import {spawn} from "cross-spawn"
import {mocked} from "ts-jest/utils"
import * as RunCommandExecutor from "../../src/executors/run-command-executor"

jest.mock("cross-spawn")

describe("run command executor", () => {
  const commands = [
    {
      valid: true,
      command: "ls",
      expected: "ls",
    },
    {
      valid: true,
      command: ["ls"],
      expected: "ls",
    },
    {
      valid: true,
      command: [
        "npx",
        ...[
          "create-app",
          "example-app",
          "--use-npm",
          "--example",
          '"https://github.com/vercel/next-learn/tree/master/basics/learn-starter"',
        ],
      ],
      expected:
        'npx create-app example-app --use-npm --example "https://github.com/vercel/next-learn/tree/master/basics/learn-starter"',
    },
    {
      valid: true,
      command: [
        "npx",
        "create-app",
        "example-app",
        "--use-npm",
        "--example",
        '"https://github.com/vercel/next-learn/tree/master/basics/learn-starter"',
      ],
      expected:
        'npx create-app example-app --use-npm --example "https://github.com/vercel/next-learn/tree/master/basics/learn-starter"',
    },
    {
      valid: false,
      command: "",
      expected: "",
    },
    {
      valid: false,
      command: [],
      expected: "",
    },
  ]

  it.each(commands)("run test case $# - `$command`", ({command, valid, expected}) => {
    const mockedSpawn = mockSpawn()
    mocked(spawn).mockImplementation(mockedSpawn.spawn as any)

    const executeCommand = RunCommandExecutor.executeCommand

    if (valid) {
      void executeCommand(command as string | [string, ...string[]]).then(() => {
        return true
      })
      return expect(mockedSpawn.calls[0]).toEqual(expected)
    } else {
      try {
        executeCommand(command as string | [string, ...string[]]).catch((e) => {
          expect(e.toString()).toMatch(`The command is too short: \`${JSON.stringify(command)}\``)
        })
      } catch (e) {
        throw e
      }
    }
  })
})

/**
 * Primitive mock of spawn function
 */
const mockSpawn = () => {
  let calls: string[] = []

  return {
    spawn: (command: string, args: string[], _: unknown = {}) => {
      const commandToExecute = args?.length > 0 ? `${command} ${args.join(" ")}` : `${command}`
      calls.push(commandToExecute)

      return {
        on: (_: string, resolve: () => void) => resolve(),
      }
    },
    calls,
  }
}
