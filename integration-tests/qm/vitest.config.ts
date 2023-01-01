/// <reference types="vitest" />

import {defineConfig} from "vitest/config"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    testTimeout: 5000 * 60 * 2,
    hookTimeout: 100000,
  },
})
