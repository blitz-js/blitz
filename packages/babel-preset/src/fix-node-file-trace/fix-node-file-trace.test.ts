import pluginTester from 'babel-plugin-tester';
import path from 'path';
import FixNodeFileTrace from './index';

pluginTester({
  pluginName: FixNodeFileTrace.name,
  plugin: FixNodeFileTrace,
  // babelOptions: require('../../../../babel.config.js'),
  fixtures: path.join(__dirname, 'tests'),
  // filename: 'pages/index.tsx',
  //   tests: [
  //     {
  //       code: `export const getStaticProps = async () => {
  //   const products = [
  //     {
  //       name: 'Hat',
  //       publishedAt: new Date(0),
  //     },
  //   ];
  //   return {
  //     props: {
  //       products,
  //     },
  //   };
  // };
  //
  // export default function Page({ products }) {
  //   return JSON.stringify(products);
  // }`,
  //       output: `import { withFixNodeFileTrace as _withFixNodeFileTrace } from '@blitzjs/core/server';
  // export const getStaticProps = _withFixNodeFileTrace(async () => {
  //   const products = [
  //     {
  //       name: 'Hat',
  //       publishedAt: new Date(0),
  //     },
  //   ];
  //   return {
  //     props: {
  //       products,
  //     },
  //   };
  // });
  //
  // export default function Page({ products }) {
  //   return JSON.stringify(products);
  // }`,
  //     },
  //   ],
});
