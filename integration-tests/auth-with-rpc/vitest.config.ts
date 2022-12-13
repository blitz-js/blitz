/// <reference types="vitest" />
import {defineConfig} from "vitest/config"

export default defineConfig({
  test: {
    testTimeout: 100000,
    hookTimeout: 100000,
  },
})
