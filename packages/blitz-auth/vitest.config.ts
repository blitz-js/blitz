import {configDefaults, defineConfig} from "vitest/config"

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "src/server/adapters/next-auth/next-auth/**/*"],
  },
})
