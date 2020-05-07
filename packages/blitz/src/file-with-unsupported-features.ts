// this is used to test out eslint's Node rules

import fs from 'fs'

// this should be a linting error since it's not available in v10,
// but it's not included in no-unsupported-features/node-builtins.
// (see Implementation: https://github.com/mysticatea/eslint-plugin-node/blob/master/lib/rules/no-unsupported-features/node-builtins.js)
fs.rmdirSync('randomDir', {recursive: true})
