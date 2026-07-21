import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Default 3090; override with PORT env var (e.g. PORT=3091 npm run dev)
const PORT = Number(process.env.PORT) || 3090;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: PORT,
  },
  preview: {
    host: "0.0.0.0",
    port: PORT,
  },
  build: {
    outDir: "build",
    sourcemap: false,
    // config.js uses top-level await to fetch whitelabel config before any
    // service captures API_URL. TLA needs a target newer than the default
    // es2020/chrome87 preset, so bump to esnext.
    target: "esnext",
  },
});
