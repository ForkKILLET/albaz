import { preview as vitePreview } from 'vite'
import colors from 'picocolors'

import { createLogger } from '../utils/log'

import { loadBlogConfig } from '../utils/config'
import { serve } from '../utils/serve'

export interface Options {
  port: number
  host: string
  dataDir?: string
  dataMode: 'proxy' | 'static' | 'direct'
}

export async function preview(options: Options) {
  const logger = createLogger({ prefix: colors.yellowBright('albaz') })
  const blogConfig = await loadBlogConfig({ logger })

  const viteLogger = createLogger({ prefix: colors.cyan('vite ') })
  const getViteServer = () => vitePreview({
    server: {
      middlewareMode: true,
    },
    clearScreen: false,
    customLogger: viteLogger,
    build: {},
  })

  await serve('preview', {
    ...options,
    logger,
    blogConfig,
    getViteServer,
  })
}
