import { createBuilder as createViteBuilder } from 'vite'
import colors from 'picocolors'

import { createLogger } from '../utils/log'
import { injectBlogConfig, loadBlogConfig } from '../utils/config'

export const build = async () => {
  const logger = createLogger({ prefix: colors.yellowBright('albaz') })
  const blogConfig = await loadBlogConfig({ logger })
  injectBlogConfig(blogConfig)

  const viteLogger = createLogger({ prefix: colors.cyan('vite ') })
  const builder = await createViteBuilder({
    clearScreen: false,
    customLogger: viteLogger,
    build: {},
  }, null)
  await builder.buildApp()
}
