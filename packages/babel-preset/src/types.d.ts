declare module '@babel/helper-module-imports' {
  import { NodePath, types } from '@babel/core';

  function addNamed(
    path: NodePath,
    named: string,
    source: string
  ): types.Identifier;
}
