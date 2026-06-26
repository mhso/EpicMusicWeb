import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  port: 5008,
  root: "epic-music/",
  base: "/epic-music/",
})
