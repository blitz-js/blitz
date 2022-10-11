import * as z from "zod"

const IncludeParam = z.enum(["authors", "tags", "count.posts"])
const FieldsParam = z.enum(["authors", "tags", "count.posts"])
const FilterParam = z.string()
const LimitParam = z.number()
const PageParam = z.number()
const OrderParam = z.string()

export const BrowseParams = z.object({
  include: z.union([IncludeParam, z.array(IncludeParam)]).optional(),
  fields: z.union([FieldsParam, z.array(FieldsParam)]).optional(),
  format: z.union([IncludeParam, z.array(IncludeParam)]).optional(),
  filter: z.union([FilterParam, z.array(FilterParam)]).optional(),
  limit: z.union([LimitParam, z.array(LimitParam)]).optional(),
  page: z.union([PageParam, z.array(PageParam)]).optional(),
  order: z.union([OrderParam, z.array(OrderParam)]).optional(),
})
