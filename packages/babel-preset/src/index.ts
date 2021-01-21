// eslint-disable-next-line import/no-default-export
export default function preset() {
  console.log();
  console.log('Loading blitz babel...');
  console.log();
  return {
    presets: [require('next/babel')],
    plugins: [require('babel-plugin-superjson-next')],
  };
}
