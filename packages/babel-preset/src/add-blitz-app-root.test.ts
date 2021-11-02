import pluginTester from 'babel-plugin-tester';
import AddBlitzAppRoot from './add-blitz-app-root';

pluginTester({
  babelrc: true,
  babelOptions: {
    presets: ['@babel/preset-typescript'],
    filename: '_app.tsx',
  },
  plugin: AddBlitzAppRoot,
  tests: {
    'should wrap default function export': {
      code: `
      export default function App({Component, pageProps}) {
        return <div>Hello</div>;
      }
       `,
      output: `
      import { withBlitzAppRoot as _withBlitzAppRoot } from 'next/stdlib';

      function App({ Component, pageProps }) {
        return <div>Hello</div>;
      }

      export default _withBlitzAppRoot(App);
       `,
    },
    'should wrap default export with const declaration': {
      code: `
      const App = ({Component, pageProps}) => {
        return <div>Hello</div>;
      };

      export default App;
       `,
      output: `
      import { withBlitzAppRoot as _withBlitzAppRoot } from 'next/stdlib';

      const App = ({ Component, pageProps }) => {
        return <div>Hello</div>;
      };

      export default _withBlitzAppRoot(App);
       `,
    },
    'should wrap a default export with class declaration': {
      code: `
      class App extends React.Component {
        render() {
          return <div>Hello</div>;
        }
      }

      export default App;
       `,
      output: `
      import { withBlitzAppRoot as _withBlitzAppRoot } from 'next/stdlib';

      class App extends React.Component {
        render() {
          return <div>Hello</div>;
        }
      }

      export default _withBlitzAppRoot(App);
       `,
    },
    'should wrap default function export without an id': {
      code: `
      export default function({Component, pageProps}) {
        return <div>Hello</div>;
      }
       `,
      output: `
      import { withBlitzAppRoot as _withBlitzAppRoot } from 'next/stdlib';
      export default _withBlitzAppRoot(function ({ Component, pageProps }) {
        return <div>Hello</div>;
      });
       `,
    },
    'should wrap an unnamed class component': {
      code: `
      export default class extends React.Component {
        render() {
          return <div>Hello</div>;
        }
      };
       `,
      output: `
      import { withBlitzAppRoot as _withBlitzAppRoot } from 'next/stdlib';
      export default _withBlitzAppRoot(
        class extends React.Component {
          render() {
            return <div>Hello</div>;
          }
        }
      );
      `,
    },
  },
});
