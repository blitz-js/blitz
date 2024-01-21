---
"blitz": minor
"@blitzjs/recipe-tailwind": minor
---

Added NextJS App Router path support to blitz/installer/utils/paths.ts to check for and provide appropriate files to recipes for the App Router. Primarily a check function to determine if the project is using a root layout file, because if so, that's an App Router setup. Changed the Tailwind recipe to accomodate for NextJS's globals.css file, which is located in /app or /src/app, decided to just add a next/ folder with a globals.css file in it for that. In the index.ts file for the recipe I added a couple of check functions (example: `templatePath: isUsingAppRouter() ? join(__dirname, "next") : join(__dirname, "templates", "styles")`). These changes are mainly just to attempt to solve the issue, relatively speaking refactoring will likely be the easier part. There's still much to do before this issue can be considered "fixed", but I figured this was an adequate start for now. As I get more familiar with the recipe system and all the moving parts my commits will become much more substantial than this one.
