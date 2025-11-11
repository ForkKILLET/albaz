import fs from 'node:fs/promises'

import { createServer as createViteServer } from 'vite'
import colors from 'picocolors'

import { createLogger } from '../utils/log'
import { loadBlogConfig } from '../utils/config'
import { serve, ServeOptions } from '../utils/serve'

export async function isDir(path: string): Promise<boolean> {
  try {
    const stat = await fs.stat(await fs.realpath(path))
    return stat.isDirectory()
  }
  catch (err) {
    return false
  }
}

export async function dev(options: ServeOptions) {
  const logger = createLogger({ prefix: colors.yellowBright('albaz') })
  const blogConfig = await loadBlogConfig({ logger })

  const viteLogger = createLogger({ prefix: colors.cyan('vite ') })

  const getViteServer = () => createViteServer({
    server: {
      middlewareMode: true,
    },
    clearScreen: false,
    customLogger: viteLogger,
  })

  await serve('dev',{
    ...options,
    logger,
    blogConfig,
    getViteServer,
  })
}
