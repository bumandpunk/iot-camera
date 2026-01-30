import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  server: {
    proxy: {
      '/api': {
        target: 'http://10.10.30.249:30345',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
})
