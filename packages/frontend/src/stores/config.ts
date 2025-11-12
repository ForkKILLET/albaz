import { BlogConfig } from '@albaz/schema'

declare global {
  interface Window {
    __ALBAZ_BLOG_CONFIG__: BlogConfig
  }
}

export const config = BlogConfig.parse(window.__ALBAZ_BLOG_CONFIG__)
