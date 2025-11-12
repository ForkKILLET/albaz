import fs from 'node:fs/promises'
import { inspect } from 'node:util'
import path from 'node:path'

import { loadConfig } from 'unconfig'
import { load as parseYaml } from 'js-yaml'
import equal from 'fast-deep-equal'
import colors from 'picocolors'
import { Plugin, normalizePath, send } from 'vite'
import { PartialDeep } from 'type-fest'
import defu from 'defu'

import { BlogConfig, Config } from '@albaz/schema'
import { cleanUrl } from './utils'
import { logger, Logger } from './logger'

export interface ConfigManagerOptions {
  logger: Logger
}

export interface ConfigLoadOptions {
  ignoreCache?: boolean
}

export interface ConfigManager {
  override(config: PartialDeep<Config>): void
  load(options?: ConfigLoadOptions): Promise<Config>
}

export const createConfigManager = (): ConfigManager => {
  let configOverride: Partial<Config> = {}
  let configCache: Config | null = null

  const load = async ({ ignoreCache = true }: ConfigLoadOptions = {}) => {
    if (configCache && ! ignoreCache) return configCache

    const { config: configRaw, sources } = await loadConfig<Config>({
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

    const { data: config, error } = Config.safeParse(configRaw)
    if (error) {
      logger.fatal(colors.red(`config is invalid: ${error.message}`))
    }

    const configFinal = defu(configOverride, config)

    if (! configCache || ! equal(configFinal, configCache)) {
      const verb = configCache ? 'updated' : 'loaded'
      logger.info(
        `config ${verb} from ${sources.length ? colors.dim(sources[0]) : 'default'}:\n` +
        inspect(configFinal, { colors: true })
      )
    }

    return configCache = configFinal
  }

  const override = (configOverrideNew: Partial<Config>) => {
    configOverride = defu(configOverrideNew, configOverride)
  }

  return {
    load,
    override,
  }
}

export const configManager = createConfigManager()

export const generateConfigScript = (config: BlogConfig): string =>
  `<script>window.__ALBAZ_BLOG_CONFIG__ = ${JSON.stringify(config)};</script>`

export const buildConfigInjector = (): Plugin => ({
  name: 'albaz:build-config-injector',
  transformIndexHtml: async (html) => {
    const config = await configManager.load()
    return html.replace(/<!-- __ALBAZ_BLOG_CONFIG__ -->/, generateConfigScript(config.blog))
  },
})

export const patchConfigHtml = (html: string, config: BlogConfig): string => (
  html.replace(
    /<script>window\.__ALBAZ_BLOG_CONFIG__ = .+?<\/script>/,
    generateConfigScript(config),
  )
)

export const previewConfigInjector = (): Plugin => ({
  name: 'albaz:preview-config-injector',
  configurePreviewServer: (server) => {
    return () => server.middlewares.use(async (req, res, next) => {
      if (res.writableEnded || req.headers['sec-fetch-dest'] === 'script') return next()

      const url = req.url && cleanUrl(req.url)
      if (! url?.endsWith('.html')) return next()

      const config = await configManager.load()

      const distDir = path.resolve(server.config.root, server.config.build.outDir)
      const indexHtmlPath = normalizePath(path.resolve(distDir, 'index.html'))

      try {
        const { headers } = server.config.preview
        const html = await fs
          .readFile(indexHtmlPath, 'utf-8')
          .then(html => patchConfigHtml(html, config.blog))

        return send(req, res, html, 'html', { headers })
      }
      catch (err) {
        return next(err)
      }
    })
  }
})
