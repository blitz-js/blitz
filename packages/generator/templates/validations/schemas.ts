import {z} from "zod"

if (process.env.parentModel) {
    export const __ModelName__Schema = z.object({
      __parentModelId__: z.__parentModelIdZodType__(),
      // template: __fieldName__: z.__zodType__(),
    })
} else {
    export const __ModelName__Schema = z.object({
       // template: __fieldName__: z.__zodType__(),
   })
}

export const Update__ModelName__Schema = __ModelName__Schema.merge(z.object({
  id: z.number(),
}))

export const Delete__ModelName__Schema = z.object({
  id: z.number(),
})