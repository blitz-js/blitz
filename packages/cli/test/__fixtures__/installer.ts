import {RecipeBuilder} from "@blitzjs/installer"

export default RecipeBuilder()
  .setName("test")
  .setDescription("test package")
  .setOwner("blitz@blitzjs.com")
  .setRepoLink("https://github.com/blitz-js/blitz")
  .printMessage({
    stepId: "print-message",
    stepName: "Print message",
    message: "Hello, World!",
  })
  .build()
