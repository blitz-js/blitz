import db from "db"
import merge from "lodash.merge"

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>
}

type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K
}[keyof T]

type Entities = NonFunctionPropertyNames<typeof db>

type CreateEntityParameters<Entity extends Entities> = Parameters<typeof db[Entity]["create"]>[0]

type CreateEntityReturnType<Entity extends Entities> = ReturnType<typeof db[Entity]["create"]>

type Options<Entity extends Entities, CustomOptions> = {
  amount?: number
  options?: CustomOptions
  merge?: RecursivePartial<CreateEntityParameters<Entity>>
}

type Seeder<Entity extends Entities, CustomOptions> = (
  options?: CustomOptions,
) => Promise<CreateEntityParameters<Entity>> | CreateEntityParameters<Entity>

export const seeder = <Entity extends Entities, CustomOptions>(
  entity: Entity,
  seeder: Seeder<Entity, CustomOptions>,
) => ({
  seed: async (options?: Options<Entity, CustomOptions>) => {
    const seeds: CreateEntityReturnType<Entity>[] = []

    const seed = db[entity].create as (
      options: CreateEntityParameters<Entity>,
    ) => CreateEntityReturnType<Entity>

    for (let i = 0; i < (options?.amount || 1); i++) {
      const data = await seeder(options?.options)

      const seededEntity = await seed(merge(data, options?.merge))

      seeds.push(seededEntity)
    }

    return seeds
  },
})
