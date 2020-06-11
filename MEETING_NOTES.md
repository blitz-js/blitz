# 2020-06-09 Blitz Contributor Call

# Blitz Contributor Call Meeting Notes June 9, 2020

- Attending: Brandon Bayer, Rudi Yardley, Fran Zekan, Adam Markon, Robert Rosenberg, Kristina Matuska
- Brandon:
  - blitzjs.com published, docs + marketing site v0.1 live
  - For now most of the docs copied from react-query and Next, we should eventually clean them up so they&#39;re stylistically similar to ours, but really easy to start
  - HTTP middleware is almost done, just fixing a few edge cases
  - Authentication is up next after that, translating pseudocode into actual code
- Kristina:
  - Homepage design mostly wrapped up right now, have to finish up mobile and light mode and then ready to move on to the rest of the docs
  - Syntax highlighting, we can customize colors
  - Sidebar inspiration from tailwindcss
- Robert:
  - Decided to wait to convert existing components to theme UI until the final design is done
  - More docs content:
    - More guides
    - Improve the tutorial to incorporate relationship generation
  - Add branches for canary and master
    - If you add a feature you can add your documentation to the canary branch
- Adam:
  - blitz generate model finished!
  - Installer rewrite complete
    - At similar place to what Gatsby has for installing stuff
  - Next up:
    - Support gatsby MDX recipes
    - Make all code generators aware of actual model attributes
- Fran:
  - Working on a package for getting the blitz config anywhere - getConfig()
  - Prevent app from &quot;warming&quot; the server when deployed as server rather than serverless
  - Testing examples - e2e with cypress and unit tests with Jest so we can link to a testing setup in the docs/getting started guide
- Rudi:
  - Extracted out the @blitzjs/file-pipeline (previously synchronizer)
  - Extracted out the @blitzjs/display package
  - Working on various Next.js compatibility issues
  - Debugging a bug in blitz start where it gets stuck at \_manifest.json


# 2020-05-26 Blitz Contributor Call

- Attending: Brandon Bayer, Robert Rosenberg, Adam Markon, Simon Debbarma
- Brandon:
  - Kitze livestream last week went great — recording on youtube
  - Codebase walkthrough yesterday went great — recording on youtube
  - Website overhaul, installed Theme UI
- Adam:
  - Opened PR for Prisma model generation from the CLI
  - Working on Installer stuff and prepping for integration with Gatsby recipes
- Simon
  - Working on custom illustrations for the web
- Robert
  - Misc work on website
- Website
  - Most website components are owned by us now instead of docusaurus, we&#39;ll need to be weary of api updates and any other important component updates
  - Make sidebar like tailwind docs sidebar
  - Dark theme needs to be fixed
  - Theme switcher inconsistent
  - Live code sandbox examples
  - Code comparison between blitz and rails
- Auth
  - Rishabh continuing to work on pseudo code for the session management library
  - Brandon planning to build http middleware support this week
- CLI
  - Adam working on new features, including generating prisma models and making existing templates aware of actual model attributes
  - Plugin ideas / discussion once recipes are farther along. Will post an RFC for plugins at some point
