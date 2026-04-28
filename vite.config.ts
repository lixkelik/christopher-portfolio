import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  // Set to "/<repo-name>/" for GitHub Pages project sites.
  // Override at build time via VITE_BASE for previews or custom domains.
  base: process.env.VITE_BASE ?? "/christopher-portfolio/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
