import { spawn } from 'cross-spawn'
import { flags } from '@oclif/command'
import { Command } from '@oclif/command'
import chalk from 'chalk'
import * as path from 'path'
import { resolveBinAsync } from '@blitzjs/server'
import { Client } from "pg"
var mysql = require('mysql2/promise');

const envPath = path.join(process.cwd(), '.env')
require('dotenv').config({ path: envPath })

const schemaPath = path.join(process.cwd(), 'db', 'schema.prisma')
const schemaArg = `--schema=${schemaPath}`
const getPrismaBin = () => resolveBinAsync('@prisma/cli', 'prisma')
const dbUrl = process.env.DATABASE_URL;

// Prisma client generation will fail if no model is defined in the schema.
// So the silent option is here to ignore that failure
export const runPrismaGeneration = async ({ silent = false } = {}) => {
	const prismaBin = await getPrismaBin()

	return new Promise((resolve) => {
		spawn(prismaBin, ['generate', schemaArg], { stdio: silent ? 'ignore' : 'inherit' }).on(
			'exit',
			(code: number) => {
				if (code === 0) {
					resolve()
				} else if (silent) {
					resolve()
				} else {
					process.exit(1)
				}
			},
		)
	})
}

export const runMigrate = async () => {
	const prismaBin = await getPrismaBin()

	return new Promise((resolve) => {
		const cp = spawn(prismaBin, ['migrate', 'save', schemaArg, '--create-db', '--experimental'], {
			stdio: 'inherit',
		})
		cp.on('exit', (code: number) => {
			if (code == 0) {
				const cp = spawn(prismaBin, ['migrate', 'up', schemaArg, '--create-db', '--experimental'], {
					stdio: 'inherit',
				})
				cp.on('exit', async (code: number) => {
					if (code == 0) {
						await runPrismaGeneration()
						resolve()
					} else {
						process.exit(1)
					}
				})
			} else {
				process.exit(1)
			}
		})
	})
}

export const ResetPostgres = async () => {
	const client = new Client({
		connectionString: dbUrl
	});
	await client.connect()
	try {
		await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO public");
	} catch (err) {
		process.exit(1)
	} finally {
		client.end()
		runMigrate()
	}
}

export const ResetMysql = async () => {
	const client = await mysql.createConnection(dbUrl)
	const dbUrlParts = dbUrl!.split('/')
	const dbName = dbUrlParts[dbUrlParts.length - 1]
	try {
		await client.query(`DROP DATABASE \`${dbName}\``)
	} catch (err) {
		console.log(err)
	} finally {
		client.end();
		runMigrate();
	}
}

export default class Db extends Command {
	static description = `Run database commands

${chalk.bold('migrate')}   Run any needed migrations via Prisma 2 and generate Prisma Client.

${chalk.bold(
		'introspect',
	)}   Will introspect the database defined in db/schema.prisma and automatically generate a complete schema.prisma file for you. Lastly, it\'ll generate Prisma Client.

${chalk.bold(
		'studio',
	)}   Open the Prisma Studio UI at http://localhost:5555 so you can easily see and change data in your database.

${chalk.bold(
		'reset',
	)}   Reset the database and run a fresh migration via Prisma 2.
`

	static args = [
		{
			name: 'command',
			description: 'Run specific db command',
			required: true,
		},
	]

	static flags = {
		help: flags.help({ char: 'h' }),
	}

	async run() {
		const { args } = this.parse(Db)
		const command = args['command']

		const prismaBin = await getPrismaBin()

		if (command === 'migrate' || command === 'm') {
			await runMigrate()
		} else if (command === 'introspect') {
			const cp = spawn(prismaBin, ['introspect', schemaArg], {
				stdio: 'inherit',
			})
			cp.on('exit', (code: number) => {
				if (code == 0) {
					spawn(prismaBin, ['generate', schemaArg], { stdio: 'inherit' }).on('exit', (code: number) => {
						if (code !== 0) {
							process.exit(1)
						}
					})
				} else {
					process.exit(1)
				}
			})
		} else if (command === 'studio') {
			const cp = spawn(prismaBin, ['studio', schemaArg, '--experimental'], {
				stdio: 'inherit',
			})
			cp.on('exit', (code: number) => {
				if (code == 0) {
				} else {
					process.exit(1)
				}
			})
		} else if (command === 'reset') {
			if (typeof dbUrl !== "undefined") {
				if (dbUrl.includes("postgresql")) {
					await ResetPostgres()
				} else if (dbUrl.includes("mysql")) {
					await ResetMysql();
				} else {
					this.log("The database url is not valid.")
				}
			} else {
				this.log("Add a database url to your .env file.")
			}
		} else {
			this.log("\nUh oh, we don't support that command.")
			this.log('You can try running a prisma command directly with:')
			this.log('\n  `npm run prisma COMMAND` or `yarn prisma COMMAND`\n')
		}
	}
}
