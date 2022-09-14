/// <reference types="vitest" />
import {defineConfig} from "vitest/config"

export default defineConfig({
  test: {
    hookTimeout: 100000,
  },
})

