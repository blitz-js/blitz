import j from "jscodeshift"
import {Collection} from "jscodeshift"

export function addBlitzMiddleware(program: Collection<j.Program>, middleware: any) {
  program
    .find(j.AssignmentExpression, {
      operator: "=",
      left: {object: {name: "module"}, property: {name: "exports"}},
      right: {},
    })
    .forEach((moduleExportsExpression) => {
      let config: j.ObjectExpression | undefined = undefined
      const obj = moduleExportsExpression.value.right
      // There are a few ways the config could be defined - this function only supports two at the moment.
      // There are probably a few other methods, but it probably starts to go out of scope for a recipe.
      if (obj.type === "Identifier") {
        // Default method, reference a variable.
        j(obj).forEach(({node}) => {
          // Lets find the variable by that name
          const configobj = program.find(j.VariableDeclarator, {
            id: {name: node.name},
          })

          // Now read it in and check it is an ObjectExpression
          configobj.forEach((path) => {
            if (path.value.init?.type === "ObjectExpression") {
              config = path.value.init
            }
          })
        })
      } else if (obj.type === "ObjectExpression") {
        // Alternative method, they're just returning object.
        config = obj
      } else {
        // TODO: handle more types if people need it
        console.warn("unhandled blitz config type: " + obj.type)
      }

      if (config) {
        // Locate the middleware property
        const middlewareProp = config.properties.find(
          (value) =>
            value.type === "ObjectProperty" &&
            value.key.type === "Identifier" &&
            value.key.name === "middleware",
        ) as j.ObjectProperty | undefined

        if (middlewareProp && middlewareProp.value.type === "ArrayExpression") {
          // We found it, pop on our middleware.
          middlewareProp.value.elements.push(middleware)
        } else {
          // No middleware prop, add our own.
          config.properties.push(
            j.property("init", j.identifier("middleware"), {
              type: "ArrayExpression",
              elements: [middleware],
              loc: null,
              comments: null,
            }),
          )
        }
      }
    })

  return program
}
