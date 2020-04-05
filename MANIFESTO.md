# The Blitz.js Manifesto

## Background

Technology follows a repeating cycle of bundling and unbundling. Created in 2005, Ruby on Rails became a major bundling force. It made web application development easier and more accessible than ever before. This benefited everyone, from those learning programming to seniors building production systems.

A major unbundling happened in 2013 with the release of React because it is hyper focused on the rendering layer. As React grew in popularity, so did the choices for all the other parts, leaving developers with hundreds of decisions to make when starting a new app. While this has contributed to JavaScript Fatigue, it's been a powerful driving force for rapid frontend innovation.

Now, in 2020, is the perfect time for another major bundling. Developers are yearning for an easier, simpler way to build web applications. Beginners want a guiding hand for building a robust app. And seniors want a framework that removes mundane tasks and provides a highly scalable architecture.

Hence the creation of Blitz.

## What is Blitz For?

Blitz is for building tiny to large fullstack database-backed applications that have one or more graphical user interfaces like web or mobile apps. 

## Foundational Principles

1. Fullstack & Monolithic
2. API Not Required
3. Convention over Configuration
4. Loose Opinions
5. Easy to Start, Easy to Scale
6. Stability
7. Community over Code

### 1. Fullstack & Monolithic

A fullstack, monolithic application is simpler than an application where frontend and backend are developed and deployed separately. Monolithic doesn't mean it will be slow or hard to scale to large teams. Monolithic doesn't mean there isn't separation of concerns. Monolithic means you can reason about your app as a single entity.

### 2. API Not Required

Until now, choosing React for your view layer required you to have a REST or GraphQL API even if it wasn't used by third-parties. This additional complexity is a significant drawback not shared by traditional server rendered apps like Ruby on Rails. 

Contrary to popular opinion, most apps don't need an API! If you are building a unicorn startup, then yes you'll need an API at some point. But unicorn startups are 1% of all applications. Most applications are much smaller, faithfully serving a constrained set of use cases for small to medium businesses that don't need Internet Scale.

This is akin to the microservices vs monolith debate. Huge companies are absolutely going to need a more microservice oriented architecture, but the vast majority of apps are much better served by a single monolith.

### 3. Convention over Configuration

Starting a new fullstack React app is currently too hard. You have to spend days on things like configuring eslint, prettier, husky, jest, cypress, typescript, deciding on a file structure, setting up a database, adding authentication and authorization, setting up a router, defining routing conventions, and setting up your styling library.

Blitz will make as many decisions and do as much work for you as possible. This makes it lightning fast to start real development. It also greatly benefits the community. Common project structure and architectural patterns make it easy to move from Blitz app to Blitz app and immediately feel at home.

Convention over configuration doesn't mean no configuration. It means configuration is optional. Blitz will provide all the escape hatches you need for bespoke customization.

### 4. Loose Opinions

Blitz is opinionated. The out-of-the-box experience guides you on a path perfect for most applications. However, Blitz isn't arrogant. It understands there are very good reasons for deviating from convention, and it allows you to do so. For example, Blitz has a conventional file structure, but, with few exceptions, doesn't _enforce_ it.

And when there's not community consensus, `blitz new` will prompt you to choose.

### 5. Easy to Start, Easy to Scale

A framework that's only easy for one end of an application lifecycle is not a good framework. Both starting and scaling must be easy.

Easy to start includes being easy for beginners and being easy to migrate existing Next.js apps to Blitz.

Scaling is important in all forms: lines of code, number of people working in the codebase, and code execution.

### 6. Stability

In the fast-paced world of Javascript, a stable, predictable release cycle is a breath of fresh air. A stable release cycle ensures minimal breaking changes, and it ensures you know exactly what and when a breaking change will occur. It also minimizes bugs in stable releases by ensuring features are in beta for a minimum amount of time. [Ember is the model citizen](https://emberjs.com/releases/) in this regard.

The exact details of the Blitz release cycle are to be determined, but we'll follow a pattern similar to Ember which strictly follows SemVer with stable releases every 6 weeks and LTS releases every 6 months.

Blitz will follow a public RFC (request for comments) process so all users and companies can participate in proposing and evaluating new features.

If a Blitz API needs to be removed, it will be deprecated in a minor release. Major releases will simply remove APIs already deprecated in a previous release.

### 7. Community over Code

The Blitz community is the most important aspect of the framework, by far.
We have a comprehensive [Code of Conduct](https://github.com/blitz-js/blitz/blob/canary/CODE_OF_CONDUCT.md). LGBTQ+, women, and minorities are especially welcome.

We are all in this together, from the youngest to the oldest. We are all more similar than we are different. We can and should solve problems together. We should learn from other communities, not compete against them.
