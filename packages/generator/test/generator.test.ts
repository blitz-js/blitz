import {Generator} from "../src/generator"

describe("generator", () => {
  describe("#replaceConditionals", () => {
    const replaceConditionals = Generator.prototype.replaceConditionals
    it("correctly picks consequent or alternate statement", () => {
      const statement = "if (process.env.condition) console.log('a'); else console.log('b')"
      // babel parser fails without semicolon in template
      expect(replaceConditionals(statement, {condition: true})).toBe("console.log('a');")
      expect(replaceConditionals(statement, {condition: false})).toBe("console.log('b')")
    })

    it("correctly picks statement with block statements", () => {
      const statement = `if (process.env.condition) {
        console.log('a')
      } else {
        console.log('b')
      }`
      expect(replaceConditionals(statement, {condition: true}).trim()).toBe("console.log('a')")
      expect(replaceConditionals(statement, {condition: false}).trim()).toBe("console.log('b')")
    })

    it("correctly handles conditionals with no alternative", () => {
      const statement = "if (process.env.condition) console.log('a')"
      expect(replaceConditionals(statement, {condition: true})).toBe("console.log('a')")
      expect(replaceConditionals(statement, {condition: false})).toBe("")
    })

    it("correctly replaces ternary statements", () => {
      let statement = "process.env.condition ? console.log('a') : console.log('b')"
      expect(replaceConditionals(statement, {condition: true})).toBe("console.log('a')")
      expect(replaceConditionals(statement, {condition: false})).toBe("console.log('b')")
    })

    it("doesn't process env variables not in the template context", () => {
      const statement = "if (process.env.IS_PRODUCTION) console.log('a')"
      expect(replaceConditionals(statement, {})).toBe(statement)
    })

    describe("JSX", () => {
      it("correctly picks consequent or alternate statement", () => {
        const statement = `
        <if condition="condition">
          <div>true</div>
          <else>
            <div>false</div>
          </else>
        </if>`
        expect(replaceConditionals(statement, {condition: true}).trim()).toMatchInlineSnapshot(
          `"<div>true</div>"`,
        )
        expect(replaceConditionals(statement, {condition: false}).trim()).toMatchInlineSnapshot(
          `"<div>false</div>"`,
        )
      })

      it("doesn't require an alternate statement", () => {
        const statement = `
        <if condition="condition">
          <div>true</div>
        </if>`
        expect(replaceConditionals(statement, {condition: true}).trim()).toMatchInlineSnapshot(
          `"<div>true</div>"`,
        )
        expect(replaceConditionals(statement, {condition: false}).trim()).toMatchInlineSnapshot(
          `""`,
        )
      })

      it("doesn't process condition if value is not in the template context", () => {
        const statement = `
        <if condition="condition">
          <div>true</div>
          <else>
            <div>false</div>
          </else>
        </if>`
        expect(replaceConditionals(statement, {})).toBe(statement)
      })
    })
  })
})
