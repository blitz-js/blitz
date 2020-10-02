import {RecipeMeta, RecipeExecutor, ExecutorConfigUnion} from "./recipe-executor"
import * as AddDependencyExecutor from "./executors/add-dependency-executor"
import * as NewFileExecutor from "./executors/new-file-executor"
import * as TransformFileExecutor from "./executors/file-transform-executor"

export interface RecipeBuilder {
  setName(name: string): RecipeBuilder
  setDescription(description: string): RecipeBuilder
  setOwner(owner: string): RecipeBuilder
  setRepoLink(repoLink: string): RecipeBuilder
  addAddDependenciesStep(step: Omit<AddDependencyExecutor.Config, "stepType">): RecipeBuilder
  addNewFilesStep(step: Omit<NewFileExecutor.Config, "stepType">): RecipeBuilder
  addTransformFilesStep(step: Omit<TransformFileExecutor.Config, "stepType">): RecipeBuilder
  build(): RecipeExecutor<any>
}

export function RecipeBuilder(): RecipeBuilder {
  const steps: ExecutorConfigUnion[] = []
  const meta: Partial<RecipeMeta> = {}

  return {
    setName(name: string) {
      meta.name = name
      return this
    },
    setDescription(description: string) {
      meta.description = description
      return this
    },
    setOwner(owner: string) {
      meta.owner = owner
      return this
    },
    setRepoLink(repoLink: string) {
      meta.repoLink = repoLink
      return this
    },
    addAddDependenciesStep(step: Omit<AddDependencyExecutor.Config, "stepType">) {
      steps.push({
        stepType: AddDependencyExecutor.type,
        ...step,
      })
      return this
    },
    addNewFilesStep(step: Omit<NewFileExecutor.Config, "stepType">) {
      steps.push({
        stepType: NewFileExecutor.type,
        ...step,
      })
      return this
    },
    addTransformFilesStep(step: Omit<TransformFileExecutor.Config, "stepType">) {
      steps.push({
        stepType: TransformFileExecutor.type,
        ...step,
      })
      return this
    },
    build() {
      return new RecipeExecutor(meta as RecipeMeta, steps)
    },
  }
}
