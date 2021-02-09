import AddBlitzAppRoot from './add-blitz-app-root';

// eslint-disable-next-line import/no-default-export
export default function preset(_api: any, options = {}) {
  return {
    presets: [[require('next/babel'), options]],
    plugins: [require('babel-plugin-superjson-next'), AddBlitzAppRoot],
  };
}
