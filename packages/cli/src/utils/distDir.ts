import colors from 'picocolors'

import { logger, Logger } from './logger'
import { isDir, resolveViteConfigPath } from './utils'
import { Err, Ok, Result } from 'fk-result'

export type DistMode = 'prebuilt' | 'local' | 'vite'

export interface GetDistDirOptions {
  distMode: DistMode | 'auto'
}

type DistDirResolver = () => Promise<Result<string | undefined, string>>

const DIST_DIR_RESOLVERS: Record<DistMode, DistDirResolver> = {
  vite: async () => {
    const hasViteConfig = await resolveViteConfigPath()
    return hasViteConfig
      ? Ok(undefined)
      : Err('missing Vite config file')
  },

  prebuilt: async () => {
    try {
      const { getDistDir } = await import('@albaz/frontend')
      return Ok(getDistDir())
    }
    catch (err) {
      return Err(`missing package ${colors.green('@albaz/frontend')}`)
    }
  },

  local: async () => {
    return await isDir('./dist')
      ? Ok('./dist')
      : Err('local dist directory does not exist')
  },
}

const DIST_MODE_ORDER: DistMode[] = ['vite', 'local', 'prebuilt']

export const getDistDir = async ({ distMode }: GetDistDirOptions): Promise<string | undefined> => {
  for (const mode of DIST_MODE_ORDER) {
    if (distMode !== 'auto' && distMode !== mode) continue

    const result = await DIST_DIR_RESOLVERS[mode]()
    if (result.isOk) {
      const distDir = result.val
      logger.info(`using dist ${colors.dim(distDir)} under mode ${colors.green(mode)}`)
      return distDir
    }
    if (distMode !== 'auto') {
      logger.fatal(`could not resolve dist under mode ${colors.green(mode)}:\n` + result.err)
    }
  }

  logger.fatal('could not resolve dist directory under any dist mode')
}
