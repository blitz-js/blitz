// import RpcServerTranform from './rpc-server-transform';

// eslint-disable-next-line import/no-default-export
export default function preset(_api: any, options = {}) {
  // const isServer = _api.caller((caller: any) => !!caller && caller.isServer);
  // console.log('IS SERVER', isServer);
  return {
    presets: [[require('next/babel'), options]],
    plugins: [require('babel-plugin-superjson-next')],
  };
}
