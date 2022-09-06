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
        src: '/icon.png',
        sizes: '512x512',
        purpose: "maskable"
      }, {
        src: '/icon.png',
        sizes: '512x512',
      }],
      share_target: {
        action: '/new',
        method: 'POST',
        params: {
          name: 'name',
          text: 'description',
          url: 'url',
          files: [{
            name: 'image',
            accept: ['image/*']
          }]
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
