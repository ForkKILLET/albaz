import fsp from 'node:fs/promises'

import { glob } from 'glob'

import { getDistDir } from '../utils/distDir'
import { safeStat } from '../utils/utils'
import { configManager, patchConfigHtml } from '../utils/config'
import { logger } from '../utils/logger'
import path from 'node:path'

export const export_ = async () => {
  const distDir = await getDistDir({ distMode: 'prebuilt' })

  const stat = await safeStat('./dist')
  if (stat.ty === 'err') {
    logger.fatal('error checking dist directory:\n' + stat.err)
  }

  if (stat.ty === 'ok') {
    if (! stat.stats.isDirectory()) {
      logger.fatal('existing dist is not a directory')
    }

    await logger.task('cleaning existing dist', async () => {
      for (const file of await glob('./dist/*')) {
        await fsp.rm(file, { recursive: true, force: true })
      }
    })
  }
  else {
    await logger.task('creating dist directory', () => fsp.mkdir('./dist'))
  }

  await logger.task('copying dist', async () => {
    for (const file of await glob(`${distDir}/*`, { dot: true })) {
      const filename = path.basename(file)
      if (filename === 'index.html') {
        logger.info('injecting blog config into index.html...')
        const { blog: blogConfig } = await configManager.load()
        const html = await fsp.readFile(file, 'utf8')
        const htmlPatched = patchConfigHtml(html, blogConfig)
        await fsp.writeFile('./dist/index.html', htmlPatched, 'utf8')
        continue
      }
      await fsp.cp(file, path.resolve('./dist', filename), { recursive: true })
    }
  })

  logger.info('export complete')
}
