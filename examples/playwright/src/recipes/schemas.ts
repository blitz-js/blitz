import { z } from "zod"

export const CreateRecipeSchema = z.object({
  name: z.string(),
  // template: __fieldName__: z.__zodType__(),
})
export const UpdateRecipeSchema = z.object({
  id: z.number(),
  // template: __fieldName__: z.__zodType__(),
})

export const DeleteRecipeSchema = z.object({
  id: z.number(),
})
