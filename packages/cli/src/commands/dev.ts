import * as Vite from 'vite'

import { buildConfigInjector } from '../utils/config'
import { serve, ServeOptions } from '../utils/serve'
import { resolveViteConfigPath } from '../utils/utils'
import { logger, viteLogger } from '../utils/logger'

export async function dev(options: ServeOptions) {

  if (! await resolveViteConfigPath()) {
    logger.fatal(`missing Vite config file`)
  }

  const viteServer = await Vite.createServer({
    plugins: [
      buildConfigInjector(),
    ],
    server: {
      middlewareMode: true,
    },
    clearScreen: false,
    customLogger: viteLogger,
  })

  await serve('dev', {
    ...options,
    viteServer,
  })
}
