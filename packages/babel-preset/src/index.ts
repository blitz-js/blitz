// eslint-disable-next-line import/no-default-export
export default function preset() {
  return {
    presets: [require('next/babel')],
    plugins: [require('babel-plugin-superjson-next')],
  };
}
