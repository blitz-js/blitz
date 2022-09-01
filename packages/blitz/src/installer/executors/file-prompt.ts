// import { prompt as enquirer } from 'enquirer'
import prompts from "prompts"

enum SearchType {
  file,
  directory,
}

interface FilePromptOptions {
  globFilter?: string
  getChoices?(context: any): string[]
  searchType?: SearchType
  context: any
}

async function getMatchingFiles(filter: string = ""): Promise<string[]> {
  let {globby} = await import("globby")
  return globby(filter, {expandDirectories: true})
}

export async function filePrompt(options: FilePromptOptions): Promise<string> {
  const choices = options.getChoices
    ? options.getChoices(options.context)
    : await getMatchingFiles(options.globFilter)

  if (choices.length === 1) {
    return `${choices[0]}`
  }

  const results: {file: string} = await prompts({
    type: "autocomplete",
    name: "file",
    message: "Select the target file",
    // @ts-ignore
    limit: 10,
    choices: choices.map((choice) => {
      return {title: choice, value: choice}
    }),
  })
  return results.file
}
