import { BlogConfig } from '@albaz/schema'

const query = new URLSearchParams(window.location.search)
const configJson = query.get('_ALBAZ_CONFIG') || import.meta.env.VITE_APP_ALBAZ_CONFIG

console.log(configJson, import.meta.env)

export const config = BlogConfig.parse(JSON.parse(configJson))
