export default class PromptAbortedError extends Error {
  constructor() {
    super('Prompt aborted')
  }
}
