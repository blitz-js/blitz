import AddBlitzAppRoot from './add-blitz-app-root';
import RewriteImports from './rewrite-imports';

// eslint-disable-next-line import/no-default-export
export default function preset(api: any, options = {}) {
  const isTest = api.env('test');

  const config = {
    presets: [[require('next/babel'), options]],
    plugins: [require('babel-plugin-superjson-next'), AddBlitzAppRoot],
  };

  if (!isTest) {
    config.plugins.push(RewriteImports);
  }

  return config;
}
