# CSS Imported by a Dependency

#### Why This Error Occurred

One of your dependencies (`node_modules`) imports a CSS file.

This normally happens when a package's source files are accidentally consumed,
instead of the built package.

#### Possible Ways to Fix It

Reach out to the maintainer and ask for them to publish a compiled version of
their dependency.

Compiled dependencies do not have references to CSS files, or any other files
that require bundler-specific integrations.

The dependency should also provide instructions about what CSS needs to be
imported by you, in your application.

Importing CSS files within `node_modules` cannot be supported because we cannot
know the correct behavior:

- Should the file be consumed as Global CSS or CSS Modules?
- If Global, in what order does the file need to be injected?
- If Modules, what are the emitted class names? As-is, camel-case, snake case?
- Etc...
