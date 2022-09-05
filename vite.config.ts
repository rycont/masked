import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA({
    manifest: {
      name: 'Masked',
      short_name: 'Masked',
      theme_color: '#8E028E',
      icons: [{
        src: '/ghost.png',
        sizes: '512x512',
        purpose: "maskable"
      }, {
        src: '/ghost.png',
        sizes: '512x512',
      }],
      share_target: {
        action: '/new',
        method: 'GET',
        params: {
          name: 'name',
          text: 'description'
        }
      }
    }
  })],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,

      }
    }
  }
})
