import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'

import '@/style.css'
import App from '@/App.vue'
import { router } from '@/router'
import zh from '@/locales/zh.json'
import en from '@/locales/en.json'

const AVAILABLE_LANGS = ['zh', 'en']

const i18n = createI18n({
  messages: {
    zh,
    en,
  },
  locale: navigator.languages
    .find(lang => AVAILABLE_LANGS.some(availableLang => lang.startsWith(availableLang))) ?? 'en',
})

const app = createApp(App)
  .use(router)
  .use(i18n)

app.mount('#app')
