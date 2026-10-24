import tailwindcss from '@tailwindcss/vite'

// Адрес опубликованного сайта: нужен для canonical, hreflang и картинки-превью ссылки.
// При публикации передаётся через NUXT_PUBLIC_SITE_URL (см. npm run deploy)
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL ?? 'http://localhost:3010'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },

  modules: ['@nuxtjs/i18n'],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: { siteUrl },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#FFF7F5' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500;1,600&family=Manrope:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  i18n: {
    defaultLocale: 'ru',
    baseUrl: siteUrl,
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false,
    locales: [
      { code: 'ru', language: 'ru-RU', name: 'RU', file: 'ru.json' },
      { code: 'kk', language: 'kk-KZ', name: 'KZ', file: 'kk.json' },
      { code: 'en', language: 'en-US', name: 'EN', file: 'en.json' },
    ],
  },
})
