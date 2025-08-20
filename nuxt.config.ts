import wasm from "vite-plugin-wasm";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxt/ui'],
  css: [ '~/assets/css/main.css' ],
  ssr: false,
  vite: {
    plugins: [
      wasm()
    ]
  }
})