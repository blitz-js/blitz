import { z } from "zod"

if (process.env.parentModel) {
  export const Create__ModelName__Schema = z.object({
    __parentModelId__: z.__parentModelIdZodType__(),
    // template: __fieldName__: z.__zodType__(),
  })
} else {
  export const Create__ModelName__Schema = z.object({
    // template: __fieldName__: z.__zodType__(),
  })
}

if (process.env.parentModel) {
  export const Update__ModelName__Schema = Create__ModelName__Schema.merge(z.object({
    id: z.__modelIdZodType__(),
    __parentModelId__: z.__parentModelIdZodType__(),
  }))
} else {
  export const Update__ModelName__Schema = Create__ModelName__Schema.merge(z.object({
    id: z.__modelIdZodType__(),
  }))
}

export const Delete__ModelName__Schema = z.object({
  id: z.__modelIdZodType__(),
})
