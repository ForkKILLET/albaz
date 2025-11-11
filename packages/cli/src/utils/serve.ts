import fs from 'node:fs/promises'
import http from 'node:http'

import express, { ErrorRequestHandler } from 'express'
import serveStatic from 'serve-static'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { PreviewServer as VitePreviewServer, ViteDevServer } from 'vite'
import colors from 'picocolors'

import { BlogConfig, BlogConfigWithDev } from '@albaz/schema'

import { injectBlogConfig } from './config'
import { Logger } from './log'
import { log } from 'node:console'

export interface ServeOptions {
  port: number
  host: string
  dataDir?: string
  dataMode: 'proxy' | 'static' | 'direct'
}

export type ServeType = 'dev' | 'preview'

export interface ServeInternalOptions<Type extends ServeType> extends ServeOptions {
  logger: Logger
  getViteServer: () => Promise<
    Type extends 'dev' ? ViteDevServer :
    Type extends 'preview' ? VitePreviewServer :
    never
  >
  blogConfig: BlogConfigWithDev
}

export interface ServeResult {
  app: express.Express
  server: http.Server
}

export async function isDir(path: string): Promise<boolean> {
  try {
    const stat = await fs.stat(await fs.realpath(path))
    return stat.isDirectory()
  }
  catch (err) {
    return false
  }
}

export const encodeURIComponentStrict = (str: string) => str.replace(/[^\w\d]/g, char => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)

export async function serve<Type extends ServeType>(type: Type, options: ServeInternalOptions<Type>): Promise<ServeResult> {
  const { blogConfig, logger, host, port, dataMode, getViteServer } = options
  const address = `http://${host}:${port}`

  const app = express()

  if (dataMode === 'static') {
    const dataDir = options.dataDir ?? blogConfig.dev.dataDir
    if (! dataDir) {
      logger.error('data directory not specified')
      process.exit(1)
    }
    if (! await isDir(dataDir)) {
      logger.error(`data directory ${colors.dim(dataDir)} does not exist`)
      process.exit(1)
    }

    app.use('/data', serveStatic(dataDir, { fallthrough: false }))

    blogConfig.dataEndpoint = `${address}/data/`
    logger.info(`data at ${colors.dim(`${address}/data/`)} (static -> ${colors.dim(dataDir)})`)
  }
  else if (dataMode === 'proxy') {
    const { dataEndpoint: dataEndpointOriginal } = blogConfig
    app.use('/data', createProxyMiddleware({
      target: dataEndpointOriginal,
      changeOrigin: true,
      logger: logger.standard,
    }))

    blogConfig.dataEndpoint = `${address}/data/`
    logger.info(`data at ${colors.dim(`${address}/data/`)} (proxy -> ${colors.dim(dataEndpointOriginal)})`)
  }
  else if (dataMode === 'direct') {
    logger.info(`data at ${colors.dim(blogConfig.dataEndpoint)} (direct)`)
  }

  injectBlogConfig(blogConfig)

  const viteServer = await getViteServer()
  app.use(viteServer.middlewares)
  const blogAddress = type === 'dev'
    ? address
    : `${address}?_ALBAZ_CONFIG=${encodeURIComponentStrict(JSON.stringify(blogConfig))}`
  viteServer.config.customLogger!.info(`blog at ${colors.dim(blogAddress)}`)

  const handleError: ErrorRequestHandler = (err, req, res, _next) => {
    logger.error(`data error ${req.method} ${colors.dim(req.url)} - ${err.message}`)
    res.setHeader('Content-Type', 'text/plain')
    res.statusCode = typeof err?.status === 'number' ? err.status : 500
    res.end(`${res.statusCode} ${http.STATUS_CODES[res.statusCode]}\n`)
  }
  app.use(handleError)

  const server = http.createServer(app)
  server.listen(port, host)

  process.on('SIGINT', () => {
    console.log()
    viteServer.close()
    viteServer.config.customLogger!.info('server closed')
    server.close()
    logger.info('server closed')

    process.exit(0)
  })

  return { app, server }
}
