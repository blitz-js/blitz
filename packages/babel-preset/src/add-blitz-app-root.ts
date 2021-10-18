import { PluginObj } from '@babel/core';
import { getFileName, wrapExportDefaultDeclaration } from './utils';

function AddBlitzAppRoot(): PluginObj {
  return {
    name: 'AddBlitzAppRoot',
    visitor: {
      ExportDefaultDeclaration(path, state) {
        const filePath = getFileName(state);

        if (!filePath?.match(/_app\./)) {
          return;
        }

        wrapExportDefaultDeclaration(path, 'withBlitzAppRoot', '@blitzjs/core');
      },
    },
  };
}

// eslint-disable-next-line import/no-default-export
export default AddBlitzAppRoot;
