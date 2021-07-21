import pluginTester from 'babel-plugin-tester';
import path from 'path';
import FixNodeFileTrace from './index';

pluginTester({
  pluginName: FixNodeFileTrace.name,
  plugin: FixNodeFileTrace,
  fixtures: path.join(__dirname, 'tests'),
});
