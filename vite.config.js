import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
}))
