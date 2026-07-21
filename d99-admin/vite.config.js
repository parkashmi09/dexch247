import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Shim process.env.REACT_APP_* so legacy source code keeps working in the browser.
  const reactAppEnv = Object.fromEntries(
    Object.entries(env)
      .filter(([key]) => key.startsWith('REACT_APP_'))
      .map(([key, value]) => [`process.env.${key}`, JSON.stringify(value ?? '')])
  )

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      ...reactAppEnv,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    server: {
      port: 5171,
    },
  }
})
