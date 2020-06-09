# `generator`

This package houses all files related to Blitz codegen. In the main `src` directory you'll find the base `generator` class and a directory of `generators` that extend it. The subclasses aren't terribly interesting, most of the fun happens in the abstract parent class. Each generator may (depending on whether it's a net new addition or modifying existing files) have a corresponding template defined in the `templates` directory.

Creating a new generator requires a new `Generator` subclass inside of `src/generators`, and potentially a new template in `templates` if the generator generates net-new files. For templates, we use our own templating language. Each variable in a template surrounded by `__` (e.g. `__modelName__`) will be replaced with the corresponding value in the object returned from `Generator::getTemplateValues`. This type of replacement works in filenames as well.

The generator framework also supports conditional code generation, similar to other common templating languages like handlebars. All model variables are exposed via `process.env` and can be used in conditional statements. The generator will not evaluate any expressions in the conditional, so the condition must be evaluated in the generator class and passed as a variable to the template. Both `if else` and ternary statements are supported, and for `if` statements no `else` is required:

```js
// VALID
if (process.env.someCondition) {
  console.log('condition was true')
}

// VALID
if (process.env.someCondition) {
  console.log('condition was true')
} else {
  console.log('condition was false')
}

// VALID
const action = process.env.someCondition
  ? () => console.log('condition was true')
  : () => console.log('condition was false')

// **NOT** VALID
// This will compile fine, but will not product the expected results.
// The template argument `someValue` will be evaluated for truthiness
// and the conditional will be evaluated based on that, regardless of
// the rest of the expression
if (process.env.someValue === 'some test') {
  console.log('dynamic condition')
}
```
