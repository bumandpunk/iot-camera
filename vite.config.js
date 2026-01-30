import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  server: {
    proxy: {
      '/api': {
        target: 'http://10.10.50.2:6160',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
})
