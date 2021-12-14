import type { ExpressionKind } from 'ast-types/gen/kinds'
import j from 'jscodeshift'
import { Program } from '../types'
import { transformBlitzConfig } from '.'

export const addBlitzMiddleware = (
  program: Program,
  middleware: ExpressionKind
): Program =>
  transformBlitzConfig(program, (config) => {
    // Locate the middleware property
    const middlewareProp = config.properties.find(
      (value) =>
        value.type === 'ObjectProperty' &&
        value.key.type === 'Identifier' &&
        value.key.name === 'middleware'
    ) as j.ObjectProperty | undefined

    if (middlewareProp && middlewareProp.value.type === 'ArrayExpression') {
      // We found it, pop on our middleware.
      middlewareProp.value.elements.push(middleware)
    } else {
      // No middleware prop, add our own.
      config.properties.push(
        j.property('init', j.identifier('middleware'), {
          type: 'ArrayExpression',
          elements: [middleware],
          loc: null,
          comments: null,
        })
      )
    }

    return config
  })
