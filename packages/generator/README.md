# `generator`

This package houses all files related to Blitz codegen. In the main `src` directory you'll find the base `generator` class and a directory of `generators` that extend it. The subclasses aren't terribly interesting, most of the fun happens in the abstract parent class. Each generator may (depending on whether it's a net new addition or modifying existing files) have a corresponding template defined in the `templates` directory.

Creating a new generator requires a new `Generator` subclass inside of `src/generators`, and potentially a new template in `templates` if the generator generates net-new files. For templates, we use our own templating language. Each variable in a template surrounded by `__` (e.g. `__modelName__`) will be replaced with the corresponding value in the object returned from `Generator::getTemplateValues`. This type of replacement works in filenames as well.
