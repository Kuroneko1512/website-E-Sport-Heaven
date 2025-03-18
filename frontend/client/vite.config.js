import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    __WS_TOKEN__: JSON.stringify(process.env.WS_TOKEN || "default-token"), 
  },
})
