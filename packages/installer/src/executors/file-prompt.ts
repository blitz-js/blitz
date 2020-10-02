import {prompt as enquirer} from "enquirer"
import globby from "globby"

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

function getMatchingFiles(filter: string = ""): Promise<string[]> {
  return globby(filter, {expandDirectories: true})
}

export async function filePrompt(options: FilePromptOptions): Promise<string> {
  const choices = options.getChoices
    ? options.getChoices(options.context)
    : await getMatchingFiles(options.globFilter)
  if (choices.length === 1) {
    return choices[0]
  }
  const results: {file: string} = await enquirer({
    type: "autocomplete",
    name: "file",
    message: "Select the target file",
    // @ts-ignore
    limit: 10,
    choices,
  })
  return results.file
}
