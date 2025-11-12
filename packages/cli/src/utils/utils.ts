import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'

export const cleanUrl = (url: string) =>url.replace(/[?#].*$/, '')

export type StatResult =
  | { ty: 'ok', stats: fs.Stats }
  | { ty: 'not-found' }
  | { ty: 'err', err: NodeJS.ErrnoException | null }

export const safeStat = async (filePath: string): Promise<StatResult> => fsp.stat(filePath)
  .then<StatResult>(stats => ({ ty: 'ok', stats }))
  .catch<StatResult>((err: NodeJS.ErrnoException | null) => {
    if (err?.code === 'ENOENT') return { ty: 'not-found' }
    return { ty: 'err', err }
  })

export const isDir = async (filePath: string) => {
  const stats = await safeStat(filePath)
  return stats.ty === 'ok' && stats.stats.isDirectory()
}

export const isFile = async (filePath: string) => {
  const stats = await safeStat(filePath)
  return stats.ty === 'ok' && stats.stats.isFile()
}

export const encodeURIComponentStrict = (str: string) => str
  .replace(/[^\w\d]/g, char => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)

const VITE_CONFIG_FILES = [
  'vite.config.js',
  'vite.config.mjs',
  'vite.config.ts',
  'vite.config.cjs',
  'vite.config.mts',
  'vite.config.cts',
]

export const resolveViteConfigPath = async () => {
  for (const filename of VITE_CONFIG_FILES) {
    const filePath = path.resolve(filename)
    if (await isFile(filePath)) return filePath
  }
  return null
}
