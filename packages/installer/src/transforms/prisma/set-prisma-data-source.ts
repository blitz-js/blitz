import {ConnectorType, DataSource} from "@prisma/generator-helper"
import {merge, produceSchema} from "./produce-schema"
import {PrismaUrl} from "./types"

/**
 * Modify the prisma datasource metadata to use the provider and url specified.
 *
 * @param source - schema.prisma source file contents
 * @param provider - the provider to use
 * @param url - the url to use
 * @returns The modified schema.prisma source
 * @example Usage
 * ```
 * setPrismaDataSource(source, "postgresql", { fromEnvVar: "DATABASE_URL" })
 * ```
 */
export function setPrismaDataSource(
  source: string,
  provider: ConnectorType,
  url: PrismaUrl,
): Promise<string> {
  return produceSchema(source, ({config}) => {
    const [db] = config.datasources
    const datasource: DataSource = {
      name: "db",
      activeProvider: provider,
      provider: [provider],
      url: Object.assign({fromEnvVar: null, value: null}, url),
      config: {},
    }
    db ? merge(db, datasource) : config.datasources.push(datasource)
  })
}
