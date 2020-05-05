# Blitz Tutorial

← [Back to Alpha Guide](https://github.com/blitz-js/blitz/blob/canary/USER_GUIDE.md)

Thanks for trying out Blitz! In this tutorial, we’ll walk you through the creation of a basic voting application.

We’ll assume that you have [Blitz installed](https://github.com/blitz-js/blitz/blob/canary/USER_GUIDE.md#blitz-app-development) already. You can tell if Blitz is installed, and which version you have by running the following command in your terminal:

```sh
$ blitz -v
```

If Blitz is installed, you should see the version of your installation. If it isn’t, you’ll get an error saying something like “command not found: blitz”.

## Creating a project

If this is your first time using Blitz, you’ll have to begin with some initial setup. We provide a command which takes care of all this for you, generating the configuration and code you need to get started.

From the command line, `cd` into the directory where you’d like to store your code, and then run the following command to create a new TypeScript blitz project:

```sh
blitz new mysite
```

_Note, you can create a JavaScript blitz project instead by running `blitz new mysite --js`; however, this tutorial assumes a TypeScript project._

This should create a `mysite` directory in your current directory.

Let’s look at what `blitz new` created:

```
mysite
├── app
│   ├── components
│   │   └── ErrorBoundary.tsx
│   ├── layouts
│   └── pages
│       ├── _app.tsx
│       ├── _document.tsx
│       └── index.tsx
├── db
│   ├── migrations
│   ├── index.ts
│   └── schema.prisma
├── integrations
├── jobs
├── node_modules
├── public
│   ├── favicon.ico
│   └── logo.png
├── utils
├── .babelrc.js
├── .env
├── .eslintrc.js
├── .gitignore
├── .npmrc
├── .prettierignore
├── README.md
├── blitz.config.js
├── package.json
├── tsconfig.json
└── yarn.lock
```

These files are:

- The `app/` directory is a container for most of your project. This is where you’ll put any pages or API routes.

- `db`/ is where your database configuration goes. If you’re writing models or checking migrations, this is where to go.

- `node_modules/` is where your “dependencies” are stored. This directory is updated by your package manager, so you don’t have to worry too much about it.

- `public/` is a directory where you will put any static assets. If you have images, files, or videos which you want to use in your app, this is where to put them.

- `utils/` is a good place to put any shared utility files which you might use across different sections of your app.

- `.babelrc.js`, `.env`, etc. ("dotfiles") are configuration files for various bits of JavaScript tooling.

- `blitz.config.js` is for advanced custom configuration of Blitz. It extends [`next.config.js`](https://nextjs.org/docs/api-reference/next.config.js/introduction).

- `package.json` contains information about your dependencies and devDependencies. If you’re using a tool like `npm` or `yarn`, you won’t have to worry about this much.

- `tsconfig.json` is our recommended setup for TypeScript.

## The development server

Let’s check that your Blitz project works. Make sure you are in the `mysite` directory, if you haven’t already, and run the following command:

```sh
$ blitz start
```

You’ll see the following output on the command line:

```sh
✔ Prepped for launch
[ wait ]  starting the development server ...
[ info ]  waiting on http://localhost:3000 ...
[ info ]  bundled successfully, waiting for typecheck results...
[ wait ]  compiling ...
[ info ]  bundled successfully, waiting for typecheck results...
[ ready ] compiled successfully - ready on http://localhost:3000
```

Now that the server’s running, visit http://localhost:3000/ with your Web browser. You’ll see a welcome page, with the Blitz logo. It worked!

## Write your first page

Now that your development environment—a “project”—is set up, you’re ready to start building out the app. First, we’ll create your first page.

Open the file `app/pages/index.tsx` and put the following code in it:

```tsx
export default () => (
  <div>
    <h1>Hello, world!</h1>
  </div>
)
```

This is the simplest page possible in Blitz. To look at it, go back to your browser and go to http://localhost:3000. You should see your text appear! Try editing the `index.tsx` file, and make it your own! When you’re ready, move on to the next section.

## Database setup

Now, we’ll setup the database and create your first model.

Open up `db/schema.prisma`. It’s a configuration file which our default database engine Prisma uses.

By default, the apps is created with SQLite. If you’re new to databases, or you’re just interested in trying Blitz, this is the easiest choice. Note that when starting your first project, you may want to use a more scalable database like PostgreSQL, to avoid the pains of switching your database down the road.

## Creating models

Now we’ll define your models — essentially your database layout — with additional metadata.

In `schema.prisma`, we’ll create two models: `Question`, and `Choice`. A `Question` has a question and a publication date. A `Choice` has two fields: the text of the choice and a vote count. Each has an id, and each `Choice` is associated with a `Question`.

Edit the `schema.prisma` file so it looks like this:

```
// (datasource and generator)

...

model Question {
  id          Int      @default(autoincrement()) @id
  text        String
  publishedAt DateTime
  choices     Choice[]
}

model Choice {
  id         Int      @default(autoincrement()) @id
  text       String
  votes      Int      @default(0)
  question   Question @relation(fields: [questionId], references: [id])
  questionId Int
}
```

Now, we need to migrate our database. This is a way of telling it that you have edited your schema in some way. Run the below command. When it asks you to enter a migration name you can enter anything you want, perhaps `
"init db":

```sh
$ blitz db migrate
```

## Playing with the API

Now, let’s hop into the interactive Blitz shell and play around with the free API Blitz gives you. To invoke the Blitz console, use this command:

```sh
$ blitz console
```

Once you’re in the console, explore the Database API:

[//]: # 'Let’s move this to await when it’s available for all */'

```sh
# No questions are in the system yet.
⚡ > db.question.findMany().then(console.log)
[]

# Create a new Question.
⚡ > let q
undefined

⚡ > db.question.create({data: {text: 'What’s new?', publishedAt: new Date()}}).then(res => q = res)
Promise { <pending> }

# See the entire object
⚡ > q
{ id: 1, text: "What’s new?", publishedAt: 2020-04-24T22:08:17.307Z }

# Or access individual values on the object.
⚡ > q.text
"What’s new?"

⚡ > q.publishedAt
2020-04-24T22:08:17.307Z

# Change values by using the update function
⚡ > db.question.update({where: {id: 1}, data: {text: 'What’s up?'}}).then(res => q = res)
Promise { <pending> }

# See the result
⚡ > q
{ id: 1, text: 'What’s up?', publishedAt: 2020-04-24T22:08:17.307Z }

# db.question.findMany() displays all the questions in the database.
⚡ > db.question.findMany().then(console.log)
[
  { id: 1, text: 'What’s up?', publishedAt: 2020-04-24T22:08:17.307Z }
]
```

## Writing more pages

Let’s create some more pages. Blitz provides a handy utility for scaffolding out pages, called `generate`. Let’s run it now with our `Question` model:

```sh
$ blitz generate all question
```

Great! Before running the app again, we need to customise some of these pages which have just been generated. Open your text editor and look at `app/questions/pages/index.tsx`. Notice that a `QuestionsList` component has been generated for you:

```jsx
export const QuestionsList = () => {
  const [questions] = useQuery(getQuestions)

  return (
    <ul>
      {questions.map((question) => (
        <li key={question.id}>
          <Link href="/questions/[id]" as={`/questions/${question.id}`}>
            <a>{question.name}</a>
          </Link>
        </li>
      ))}
    </ul>
  )
}
```

This won’t work though! Remember that the `Question` model we created above doesn’t have any `name` field. To fix this, replace `question.name` with `question.text`:

```jsx
export const QuestionsList = () => {
  const [questions] = useQuery(getQuestions)

  return (
    <ul>
      {questions.map((question) => (
        <li key={question.id}>
          <Link href="/questions/[id]" as={`/questions/${question.id}`}>
            <a>{question.text}</a>
          </Link>
        </li>
      ))}
    </ul>
  )
}
```

Next, let’s apply a similar fix to `app/questions/pages/questions/new.tsx`. In the form submission, replace

```jsx
const question = await createQuestion({data: {name: 'MyName'}})
```

with

```jsx
const question = await createQuestion({
  data: {text: 'Do you love Blitz?', publishedAt: new Date()},
})
```

Finally, we just need to fix the edit page. Open `app/questions/pages/questions/[id]/edit.tsx` and replace

```jsx
const updated = await updateQuestion({
  where: {id: question.id},
  data: {name: 'MyNewName'},
})
```

with

```jsx
const updated = await updateQuestion({
  where: {id: question.id},
  data: {text: 'Do you really love Blitz?'},
})
```

Great! Now make sure your app is running. If it isn’t, just run `blitz start` in your terminal, and visit http://localhost:3000/questions. Play around with your new app a bit! Try creating questions, editing, and deleting them.

## Writing a minimal form

You’re doing great so far! The next thing we’ll do is give our form some real inputs. At the moment it’s giving every `Question` the same name! Have a look at `app/questions/pages/questions/new.tsx` in your editor.

Delete the div that says: `<div>Put your form fields here. But for now, just click submit</div>`, and replace it with some inputs:

```jsx
<input placeholder="Name" />

<input placeholder="Choice 1" />
<input placeholder="Choice 1" />
<input placeholder="Choice 1" />
```

Finally, we’re going to make sure all that data is submitted. In the end, your page should look something like this:

```jsx
import {Head, Link, useRouter} from 'blitz'
import createQuestion from 'app/questions/mutations/createQuestion'

const NewQuestionPage = () => {
  const router = useRouter()

  return (
    <div className="container">
      <Head>
        <title>New Question</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Create New Question </h1>

        <form
          onSubmit={async (event) => {
            event.preventDefault()

            try {
              const question = await createQuestion({
                data: {
                  text: event.target[0].value,
                  publishedAt: new Date(),
                  choices: {
                    create: [
                      {text: event.target[1].value},
                      {text: event.target[2].value},
                      {text: event.target[3].value},
                    ],
                  },
                },
              })
              alert('Success!' + JSON.stringify(question))
              router.push('/questions/[id]', `/questions/${question.id}`)
            } catch (error) {
              alert('Error creating question ' + JSON.stringify(error, null, 2))
            }
          }}>
          <input placeholder="Name" />

          <input placeholder="Choice 1" />
          <input placeholder="Choice 1" />
          <input placeholder="Choice 1" />

          <button>Submit</button>
        </form>

        <p>
          <Link href="/questions">
            <a>Questions</a>
          </Link>
        </p>
      </main>
    </div>
  )
}

export default NewQuestionPage
```

## Listing choices

Time for a breather. Go back to `http://localhost:3000/questions` in your browser and look at all the questions you‘ve created. How about we list these questions’ choices here too? First, we need to customise the question queries. In Prisma, you need to manually let the client know that you want to query for nested relations. Change your `getQuestion.ts` and `getQuestions.ts` files to look like this:

```js
// app/questions/queries/getQuestion.ts

import db, {FindOneQuestionArgs} from 'db'

export default async function getQuestion(args: FindOneQuestionArgs) {
  const question = await db.question.findOne({...args, include: {choices: true}})

  return question
}
```

```js
// app/questions/queries/getQuestions.ts

import db, {FindManyQuestionArgs} from 'db'

export default async function getQuestions(args: FindManyQuestionArgs) {
  const questions = await db.question.findMany({...args, include: {choices: true}})

  return questions
}
```

Now hop back to our main questions page in your editor, and we can list the choices of each question easily. Just add this code beneath the `Link` in our `QuestionsList`:

```jsx
<ul>
  {question.choices.map((choice) => (
    <li key={choice.id}>
      {choice.text} - {choice.votes} votes
    </li>
  ))}
</ul>
```

Magic! Let’s do one more thing–let people vote on these questions!

Open `app/questions/pages/questions/[id].tsx` in your editor. First, we’re going to improve this page somewhat.

1. Replace `<h1>Question {question.id}</h1>` with `<h1>{question.text}</h1>`.

2. Delete the `pre` element, and copy in our choices list which we wrote before:

```jsx
<ul>
  {question.choices.map((choice) => (
    <li key={choice.id}>
      {choice.text} - {choice.votes} votes
    </li>
  ))}
</ul>
```

If you go back to your browser, your page should now look something like this!

<img width="567" alt="Screenshot 2020-04-27 at 16 06 55" src="https://user-images.githubusercontent.com/24858006/80387990-3c3d8b80-88a1-11ea-956a-5be85f1e8f12.png">

Now that you’ve improved the question page, it’s time for the vote button.

First, we need a new mutation. Create a file at `app/questions/mutations/updateChoice.ts`, and paste in the following code:

```js
import db, {ChoiceUpdateArgs} from 'db'

export default async function updateChoice(args: ChoiceUpdateArgs) {
  // Don't allow updating ID
  delete args.data.id

  const choice = await db.choice.update(args)

  return choice
}
```

Back in `app/questions/pages/questions/[id].tsx`, we can now add a vote button.

In our `li`, add a button like so:

```jsx
<li key={choice.id}>
  {choice.text} - {choice.votes} votes
  <button>Vote</button>
</li>
```

Then, import our `updateChoice` mutation, and create a `handleVote` function in our page:

```jsx
import updateChoice from "app/questions/mutations/updateChoice"

...

const handleVote = async (id, votes) => {
  try {
    const updated = await updateChoice({
      where: { id },
      data: { votes: votes + 1 },
    })
    alert("Success!" + JSON.stringify(updated))
  } catch (error) {
    alert("Error creating question " + JSON.stringify(error, null, 2))
  }
}

return (

...
```

Finally, we’ll just tell our `button` to call that function!

```jsx
<button onClick={() => handleVote(choice.id, choice.votes)}>Vote</button>
```

Just to be sure, this is what all that should look like:

```jsx
import { Suspense } from "react"
import { Head, Link, useRouter, useQuery } from "blitz"
import getQuestion from "app/questions/queries/getQuestion"
import deleteQuestion from "app/questions/mutations/deleteQuestion"
import updateChoice from "app/questions/mutations/updateChoice"

export const Question = () => {
  const router = useRouter()
  const id = parseInt(router?.query.id as string)
  const [question] = useQuery(getQuestion, { where: { id } })

  const handleVote = async (id, votes) => {
    try {
      const updated = await updateChoice({
        where: { id },
        data: { votes: votes + 1 },
      })
      alert("Success!" + JSON.stringify(updated))
    } catch (error) {
      alert("Error creating question " + JSON.stringify(error, null, 2))
    }
  }

  return (
    <div>
      <h1>{question.text}</h1>
      <ul>
        {question.choices.map((choice) => (
          <li key={choice.id}>
            {choice.text} - {choice.votes} votes
            <button onClick={() => handleVote(choice.id, choice.votes)}>Vote</button>
          </li>
        ))}
      </ul>

      <Link href="/questions/[id]/edit" as={`/questions/${question.id}/edit`}>
        <a>Edit</a>
      </Link>

      <button
        type="button"
        onClick={async () => {
          if (confirm("This will be deleted")) {
            await deleteQuestion({ where: { id: question.id } })
            router.push("/questions")
          }
        }}
      >
        Delete
      </button>
    </div>
  )
}

const ShowQuestionPage = () => {
  return (
    <div className="container">
      <Head>
        <title>Question</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <p>
          <Link href="/questions">
            <a>Questions</a>
          </Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <Question />
        </Suspense>
      </main>
    </div>
  )
}

export default ShowQuestionPage
```

## Conclusion

🥳 Congrats! You just created your very own Blitz app! Have fun playing around with it, or sharing it with your friends. Now that you’ve finished this tutorial, why not try making your voting app even better? You could try:

- Adding styling
- Showing some more statistics about votes
- Deploying live so you can send it around (we recommend [Vercel](https://vercel.com/))

If you want to share your project with the world wide Blitz community there is no better place to do that than on Slack.

Just visit https://slack.blitzjs.com. Then, post the link to the **#show-and-tell** channel to share it with everyone!
