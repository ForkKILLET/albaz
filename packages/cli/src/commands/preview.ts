import * as Vite from 'vite'

import { createConfigManager, previewConfigInjector } from '../utils/config'
import { DataMode, serve } from '../utils/serve'
import { DistMode, getDistDir } from '../utils/distDir'
import { viteLogger } from '../utils/logger'

export interface Options {
  port: number
  host: string
  dataDir?: string
  distMode: DistMode | 'auto'
  dataMode: DataMode
}

export async function preview(options: Options) {
  const outDir = await getDistDir({
    distMode: options.distMode,
  })

  const viteServer = await Vite.preview({
    build: {
      outDir,
    },
    plugins: [
      previewConfigInjector(),
    ],
    server: {
      middlewareMode: true,
    },
    clearScreen: false,
    customLogger: viteLogger,
  })

  await serve('preview', {
    ...options,
    viteServer,
  })
}
