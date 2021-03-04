import AddBlitzAppRoot from './add-blitz-app-root';
import RewriteImports from './rewrite-imports';

// eslint-disable-next-line import/no-default-export
export default function preset(_api: any, options = {}) {
  // const isTest = _api.env('test');
  const isRunningInJest = Boolean(process.env.JEST_WORKER_ID);

  const config = {
    presets: [[require('next/babel'), options]],
    plugins: [require('babel-plugin-superjson-next'), AddBlitzAppRoot],
  };

  if (!isRunningInJest) {
    config.plugins.push(RewriteImports);
  }

  return config;
}
