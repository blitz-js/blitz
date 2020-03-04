import * as path from 'path'
import {Command, flags} from '@oclif/command'
import ContextGenerator from '../generators/context'
const { MultiSelect } = require('enquirer')
const debug = require('debug')('blitz:new')

export interface Flags {
  ts: boolean
  yarn: boolean
}

interface InitialMethodOption { name: string }

export default class NewEntity extends Command {
  static description = 'Generate a new Blitz entity'

  static args = [
    {
      name: 'contextArg',
      required: true,
      description: 'context/entity name and path',
    },
  ]

  static flags = {
    help: flags.help({char: 'h'})
  }

  static initialControllerMethodOptions: InitialMethodOption[] = [
    { name: 'ALL' },
    { name: 'index' },
    { name: 'show' },
    { name: 'create' },
    { name: 'update' },
    { name: 'delete' }
  ]

  async requestInitialControllerMethods() :Promise<string[]> {
    try {
      const prompt = new MultiSelect({
        message: 'Select initial methods',
        choices: NewEntity.initialControllerMethodOptions
      });

      const result = await prompt.run()
      return result
    } catch (err) {
      this.error(err)
    }
  }

  transformArguments(contextArg: string) :{contextPath: string, contextName: string, entityName: string} {
    const splitArg = contextArg.split('/')
    const [contextName] = [...splitArg].slice(-2);
    const contextPath = splitArg.join('/')

    return {
      contextPath: contextPath,
      contextName,
      entityName: splitArg[splitArg.length - 1]
    }
  }

  async run() {
    const {args, args: {contextArg}, flags} = this.parse(NewEntity)
    debug('args: ', args)
    debug('flags: ', flags)

    const {contextPath, contextName, entityName} = this.transformArguments(contextArg)

    const destinationRoot = process.cwd() + `/${contextPath}` 

    const generator = new ContextGenerator({
      sourceRoot: path.join(__dirname, '../../templates/entity'),
      destinationRoot,
      contextPath,
      contextName,
      entityName,
    })

    try {
      await generator.run()
      this.log(`${contextName} Context Generated!`)
    } catch (err) {
      this.error(err)
    }
  }
}
