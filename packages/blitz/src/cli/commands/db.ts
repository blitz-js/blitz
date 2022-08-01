import {CliCommand} from "../index"
import arg from "arg"
import {join} from "path"
import {REGISTER_INSTANCE} from "ts-node"
import chalk from "chalk"

const args = arg(
  {
    // Types
    "--help": Boolean,
    "--env": String,
    "--file": String,

    // Aliases
    "-h": "--help",
    "-e": "--env",
    "-f": "--file",
  },
  {
    permissive: true,
  },
)

const runSeed = async (seedBasePath: string) => {
  if (!process[REGISTER_INSTANCE]) {
    // During blitz interal dev, oclif automaticaly sets up ts-node so we have to check
    require("ts-node").register({compilerOptions: {module: "commonjs"}})
  }
  require("tsconfig-paths/register")

  const seedPath = join(process.cwd(), seedBasePath)
  const dbPath = join(process.cwd(), "db/index")
  console.log(chalk.magenta("Seeding database"))

  let seeds: Function | undefined
  try {
    seeds = require(seedPath).default
    if (seeds === undefined) {
      throw new Error(`Couldn't find default export from ${seedBasePath}`)
    }
  } catch (err) {
    console.log(chalk.red(`Couldn't import default from ${seedBasePath}`))
    throw err
  }

  try {
    console.log("\n" + "Seeding...")
    seeds && (await seeds())
  } catch (err) {
    console.log(err)
    throw err
  }

  const db = require(dbPath).default
  await db.$disconnect()
  console.log("Done Seeding")
}

const db: CliCommand = async () => {
  let filePath = "db/seeds"

  if (args["--file"]) {
    filePath = args["--file"]
  }

  if (args["--help"]) {
    console.log(`Run database commands
    ${chalk.bold("seed")} Generated seeded data in database via Prisma.
    `)
  }

  if (args["_"].slice(1)[0] && args["_"].slice(1)[0] === "seed") {
    try {
      return await runSeed(filePath)
    } catch (err) {
      console.log(chalk.red("Could not seed database:"))
      console.log(err)
      process.exit(1)
    }
  } else {
    if (!args["--help"]) {
      console.log("\nThat command is no longer available..")
      console.log("For any prisma related commands, use the `blitz prisma` command instead:")
      console.log("\n  `blitz prisma COMMAND`\n")
    }
    return
  }
}

export {db}
