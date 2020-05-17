import {Generator} from '../src/generator'

describe('generator', () => {
  describe('#replaceConditionals', () => {
    const replaceConditionals = Generator.prototype.replaceConditionals
    it('correctly picks consequent or alternate statement', () => {
      const statement = "if (process.env.condition) console.log('a'); else console.log('b')"
      // babel parser fails without semicolon in template
      expect(replaceConditionals(statement, {condition: true})).toBe("console.log('a');")
      expect(replaceConditionals(statement, {condition: false})).toBe("console.log('b')")
    })

    it('correctly picks statement with block statements', () => {
      const statement = `if (process.env.condition) {
        console.log('a')
      } else {
        console.log('b')
      }`
      expect(replaceConditionals(statement, {condition: true}).trim()).toBe("console.log('a')")
      expect(replaceConditionals(statement, {condition: false}).trim()).toBe("console.log('b')")
    })

    it('correctly handles conditionals with no alternative', () => {
      const statement = "if (process.env.condition) console.log('a')"
      expect(replaceConditionals(statement, {condition: true})).toBe("console.log('a')")
      expect(replaceConditionals(statement, {condition: false})).toBe('')
    })

    it('correctly replaces ternary statements', () => {
      let statement = "process.env.condition ? console.log('a') : console.log('b')"
      expect(replaceConditionals(statement, {condition: true})).toBe("console.log('a')")
      expect(replaceConditionals(statement, {condition: false})).toBe("console.log('b')")
    })

    it("doesn't process env variables not in the template context", () => {
      const statement = "if (process.env.IS_PRODUCTION) console.log('a')"
      expect(replaceConditionals(statement, {})).toBe(statement)
    })
  })
})
