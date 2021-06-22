import {
  NodePath,
  PluginObj,
  types as BabelTypes,
} from 'next/dist/compiled/babel/core'
// import { SERVER_PROPS_SSG_CONFLICT } from '../../../lib/constants'
// import {
//   SERVER_PROPS_ID,
//   STATIC_PROPS_ID,
// } from '../../../next-server/lib/constants'

type PluginState = {
  refs: Set<NodePath<BabelTypes.Identifier>>
  isPrerender: boolean
  isServerProps: boolean
  done: boolean
}

export default function blitzRpcClient({
  types: t,
}: {
  types: typeof BabelTypes
}): PluginObj<PluginState> {
  return {
    visitor: {
      Program: {
        enter(path, state) {
          state.refs = new Set<NodePath<BabelTypes.Identifier>>()
          state.isPrerender = false
          state.isServerProps = false
          state.done = false
        },
      },
    },
  }
}
