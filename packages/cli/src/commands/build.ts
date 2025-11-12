import * as Vite from 'vite'

import { buildConfigInjector, createConfigManager } from '../utils/config'
import { resolveViteConfigPath } from '../utils/utils'
import dtsPlugin from 'vite-plugin-dts'
import { logger, viteLogger } from '../utils/logger'

export const build = async () => {

  if (! await resolveViteConfigPath()) {
    logger.fatal(`missing Vite config file`)
  }

  logger.info('building app...')
  await Vite.build({
    plugins: [
      buildConfigInjector(),
    ],
    clearScreen: false,
    customLogger: viteLogger,
  })

  logger.info('building lib...')
  await Vite.build({
    configFile: false,
    plugins: [
      dtsPlugin({
        tsconfigPath: 'tsconfig.lib.json',
      }),
    ],
    build: {
      outDir: 'lib',
      lib: {
        entry: 'src-lib/index.ts',
        fileName: 'index',
        formats: ['es'],
      },
      emitAssets: false,
      copyPublicDir: false,
      rollupOptions: {
        external: ['node:path'],
      }
    },
    clearScreen: false,
    customLogger: viteLogger,
  })

  logger.info('build complete')
}
