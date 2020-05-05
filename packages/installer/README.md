# `installer`

The installer package houses all of the types, classes, and utilities for building a Blitz Installer. A Blitz installer is effectively just a list of steps, represented as an array of objects that conform to one of the types in the `Executor` union type (`NewFileExecutor | AddDependencyExecutor } FileTransformExecutor`). These executors are processed by the framework, executed interactively by the user, and ultimately run to install new packages to an existing Blitz app.

You can find the implementation of all Executors in the `executors/` directory, stock transforms that we'll be supplying to authors in `transforms/`, and various utilities in `utils/`, including a `paths` utility that the user can access for common paths to modify such as `_document.tsx`.
