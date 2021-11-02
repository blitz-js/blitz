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
      export default function App() {
        return <div>Hello</div>;
      }
       `,
      output: `
      import { withBlitzAppRoot as _withBlitzAppRoot } from 'next/stdlib';

      function App() {
        return <div>Hello</div>;
      }

      export default _withBlitzAppRoot(App);
       `,
    },
    'should wrap default export with const declaration': {
      code: `
      const App = () => {
        return <div>Hello</div>;
      };

      export default App;
       `,
      output: `
      import { withBlitzAppRoot as _withBlitzAppRoot } from 'next/stdlib';

      const App = () => {
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
    'should wrap an unnamed function': {
      code: `
      export default function() {
        return <div>Hello</div>;
      }
       `,
      output: `
      import { withBlitzAppRoot as _withBlitzAppRoot } from 'next/stdlib';
      export default _withBlitzAppRoot(function () {
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
    'should wrap default export with const declaration with custom HOC': {
      code: `
      const App = () => {
        return <div>Hello</div>;
      };
      export default withTranslations(App);
       `,
      output: `
      import { withBlitzAppRoot as _withBlitzAppRoot } from 'next/stdlib';

      const App = () => {
        return <div>Hello</div>;
      };

      export default withTranslations(_withBlitzAppRoot(App));
       `,
    },
    'should wrap default function export with custom HOC': {
      code: `
      export default withTranslations(function App() {
        return <div>Hello</div>;
      });
       `,
      output: `
      import { withBlitzAppRoot as _withBlitzAppRoot } from 'next/stdlib';
      export default withTranslations(
        _withBlitzAppRoot(function App() {
          return <div>Hello</div>;
        })
      );
       `,
    },
    'should wrap a default export with class declaration with custom HOC': {
      code: `
      class App extends React.Component {
        render() {
          return <div>Hello</div>;
        }
      }

      export default withTranslations(App);
       `,
      output: `
      import { withBlitzAppRoot as _withBlitzAppRoot } from 'next/stdlib';

      class App extends React.Component {
        render() {
          return <div>Hello</div>;
        }
      }

      export default withTranslations(_withBlitzAppRoot(App));
       `,
    },
    'should wrap an unnamed function with custom HOC': {
      code: `
      export default withTranslations(function() {
        return <div>Hello</div>;
      })
       `,
      output: `
      import { withBlitzAppRoot as _withBlitzAppRoot } from 'next/stdlib';
      export default withTranslations(
        _withBlitzAppRoot(function () {
          return <div>Hello</div>;
        })
      );
       `,
    },
    'should wrap an unnamed class component with custom HOC': {
      code: `
      export default withTranslations(class extends React.Component {
        render() {
          return <div>Hello</div>;
        }
      });
       `,
      output: `
      import { withBlitzAppRoot as _withBlitzAppRoot } from 'next/stdlib';
      export default withTranslations(
        _withBlitzAppRoot(
          class extends React.Component {
            render() {
              return <div>Hello</div>;
            }
          }
        )
      );
      `,
    },
    'handles multiple HOCs and looks up variable declaration': {
      code: `
      const App = withX(withY(withZ(() => null)));

      export default App;
       `,
      output: `
      import { withBlitzAppRoot as _withBlitzAppRoot } from 'next/stdlib';
      const App = withX(withY(withZ(_withBlitzAppRoot(() => null))));
      export default App;
      `,
    },
    'handles multiple components and multiple HOCs': {
      code: `
      const OtherComponent = withX(() => null);
      const App = withX(withY(withZ(() => null)));
      export default withTranslations(App);
       `,
      output: `
      import { withBlitzAppRoot as _withBlitzAppRoot } from 'next/stdlib';
      const OtherComponent = withX(() => null);
      const App = withX(withY(withZ(_withBlitzAppRoot(() => null))));
      export default withTranslations(App);
      `,
    },
  },
});
