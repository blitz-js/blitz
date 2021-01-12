import {render} from "ink-testing-library"
import React from "react"
import {Frontmatter} from "../../src/executors/executor"
describe("Executor", () => {
  const executorConfig = {
    stepId: "newFile",
    stepName: "New File",
    stepType: "new-file",
    explanation: "Testing text for a new file",
  }
  it("should render Frontmatter", () => {
    const {lastFrame} = render(<Frontmatter executor={executorConfig} />)

    expect(lastFrame()).toMatchSnapshot()
  })

  it("should contain a step name and explanation", () => {
    const {frames} = render(<Frontmatter executor={executorConfig} />)

    expect(frames[0].includes("New File")).toBeTruthy()
    expect(frames[0].includes("Testing text for a new file")).toBeTruthy()
  })
})
