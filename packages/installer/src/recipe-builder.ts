import * as AddDependencyExecutor from "./executors/add-dependency-executor"
import * as TransformFileExecutor from "./executors/file-transform-executor"
import * as NewFileExecutor from "./executors/new-file-executor"
import {ExecutorConfigUnion, RecipeExecutor} from "./recipe-executor"
import {RecipeMeta} from "./types"

export interface IRecipeBuilder {
  setName(name: string): IRecipeBuilder
  setDescription(description: string): IRecipeBuilder
  setOwner(owner: string): IRecipeBuilder
  setRepoLink(repoLink: string): IRecipeBuilder
  addAddDependenciesStep(step: Omit<AddDependencyExecutor.Config, "stepType">): IRecipeBuilder
  addNewFilesStep(step: Omit<NewFileExecutor.Config, "stepType">): IRecipeBuilder
  addTransformFilesStep(step: Omit<TransformFileExecutor.Config, "stepType">): IRecipeBuilder
  build(): RecipeExecutor<any>
}

export function RecipeBuilder(): IRecipeBuilder {
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
