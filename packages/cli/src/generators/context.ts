import Generator, {GeneratorOptions} from '../generator'

export interface ContextGeneratorOptions extends GeneratorOptions {
  contextPath: string
  contextName: string
  entityName: string
}

class ContextGenerator extends Generator<ContextGeneratorOptions> {
  capitalizeStr(str: string): string {
    return str[0].toUpperCase() + str.substring(1, str.length)
  }

  createFilePrefix(): string {
    if (this.options.contextPath.split('/').length > 1)
      return this.capitalizeStr(this.options.contextName) + this.capitalizeStr(this.options.entityName)
    else return this.capitalizeStr(this.options.entityName)
  }

  async write() {
    const filePrefix = this.createFilePrefix()
    console.log('filePrefix :', filePrefix)

    this.fs.copyTpl(
      this.sourcePath('controller.js.ejs'),
      this.destinationPath(`/${filePrefix}Controller.js`),
      {
        prefix: filePrefix,
      },
    )

    this.fs.copyTpl(this.sourcePath('model.js.ejs'), this.destinationPath(`/${filePrefix}Model.js`), {
      prefix: filePrefix,
    })

    this.makeDir(`${this.options.destinationRoot!}/pages`)

    //TODO: figure out how to make directory from this class to generate /pages folder
  }
}

export default ContextGenerator
