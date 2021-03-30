import {DMMF} from "@prisma/generator-helper"
import {EnvValue, GeneratorConfig} from "@prisma/generator-helper"

export type PrismaModel = Partial<DMMF.Model> & {
  name: string
  fields: PrismaField[]
}

export type PrismaField = Partial<DMMF.Field> & {name: string; type: string}

export type PrismaGenerator = Partial<GeneratorConfig> & {
  name: string
  provider: string
}

export interface PrismaEnum {
  name: string
  values: string[]
}

export type PrismaIndex = Partial<DMMF.uniqueIndex> & {
  name: string
  fields: string[]
}

export type PrismaUrl = Partial<EnvValue>
