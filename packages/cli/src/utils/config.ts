import fs from 'node:fs/promises'
import { inspect } from 'node:util'

import { loadConfig } from 'unconfig'
import { load as parseYaml } from 'js-yaml'
import colors from 'picocolors'
import { Logger } from 'vite'

import { BlogConfig, BlogConfigWithDev } from '@albaz/schema'

export interface LoadBlogConfigOptions {
  logger: Logger
}

export async function loadBlogConfig({ logger }: LoadBlogConfigOptions): Promise<BlogConfigWithDev> {
  const { config: blogConfigRaw, sources } = await loadConfig<BlogConfig>({
    sources: [
      {
        files: 'albaz.config',
        extensions: ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'yml'],
      },
      {
        files: 'albaz.config',
        extensions: ['yaml', 'yml'],
        parser: async path => parseYaml(await fs.readFile(path, 'utf8')) as any,
      }
    ],
  })

  const { data: blogConfig, error } = BlogConfigWithDev.safeParse(blogConfigRaw)
  if (error) {
    logger.error(colors.red(`config is invalid: ${error.message}`))
    process.exit(1)
  }
  if (sources.length) {
    logger.info(`config loaded from ${colors.dim(sources[0])}:`)
  }
  else {
    logger.info('config loaded from defaults:')
  }
  logger.info(inspect(blogConfig, { colors: true }))

  return blogConfig
}

export async function injectBlogConfig({ dev, ...blogConfig }: BlogConfigWithDev) {
  process.env.VITE_APP_ALBAZ_CONFIG = JSON.stringify(blogConfig)
}
