import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"

// Vite config — https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === "development" ? "/" : "/P.I-Ecosis-Prototipo/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
}))
