import arg from "arg"

const commonArgs = {
  // Types
  "--help": Boolean,

  // Aliases
  "-h": "--help",
}

const args = arg(commonArgs, {
  permissive: true,
})

const commands: {[command: string]: () => Promise<() => void>} = {
  "upgrade-legacy": () => import("./upgrade-legacy").then((i) => i.upgradeLegacy),
}

const foundCommand = Boolean(commands[args._[0] as string])
const forwardedArgs = foundCommand ? args._.slice(1) : args._

if (foundCommand) {
  commands[args["_"][0] as string]?.()
    .then((exec: any) => exec(forwardedArgs))
    .catch((err) => {
      console.log(err)
    })
} else {
  console.log("Codemod not found. Try one of these:")
  console.log(`${Object.keys(commands).map((c) => c)}`)
}
