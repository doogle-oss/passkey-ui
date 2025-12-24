import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { componentTagger } from "lovable-tagger";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 3000,
    proxy: {
      '/q': {
        target: 'http://localhost:8080',
        changeOrigin: false,
        router: (req) => {
          const host = req.headers.host?.split(':')[0] || 'localhost';
          return `http://${host}:8080`;
        },
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: false,
        router: (req) => {
          const host = req.headers.host?.split(':')[0] || 'localhost';
          return `http://${host}:8080`;
        },
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), tailwindcss({
    optimize: { minify: false}
  })].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/main/js"),
    },
  },
  build: {
    outDir: "target/classes/META-INF/resources",
    emptyOutDir: true,
  },
}));
