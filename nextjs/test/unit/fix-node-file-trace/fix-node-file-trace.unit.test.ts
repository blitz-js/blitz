import pluginTester from 'babel-plugin-tester'
import path from 'path'
import FixNodeFileTrace from 'next/dist/build/babel/plugins/fix-node-file-trace'

pluginTester({
  pluginName: FixNodeFileTrace.name,
  plugin: FixNodeFileTrace,
  fixtures: path.join(__dirname, 'tests'),
})
