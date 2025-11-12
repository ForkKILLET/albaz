import http from 'node:http'

import Connect from 'connect'
import serveStatic from 'serve-static'
import { createProxyServer } from 'http-proxy-3'
import * as Vite from 'vite'
import colors from 'picocolors'

import { logger, Logger } from './logger'
import { configManager, ConfigManager } from './config'
import { isDir } from './utils'

export type DataMode = 'proxy' | 'static' | 'direct'

export interface ServeOptions {
  port: number
  host: string
  dataDir?: string
  dataMode: DataMode
}

export type ServeType = 'dev' | 'preview'

export interface ServeInternalOptions<Type extends ServeType> extends ServeOptions {
  viteServer: (
    Type extends 'dev' ? Vite.ViteDevServer :
    Type extends 'preview' ? Vite.PreviewServer :
    never
  )
}

export interface ServeResult {
  app: Connect.Server
  server: http.Server
}

export async function serve<Type extends ServeType>(type: Type, options: ServeInternalOptions<Type>): Promise<ServeResult> {
  const { host, port, dataMode, viteServer } = options
  const address = `http://${host}:${port}`

  const app = Connect()

  const config = await configManager.load({ ignoreCache: true })

  if (dataMode === 'static') {
    const dataDir = options.dataDir ?? config.dev.dataDir
    if (! dataDir) {
      logger.fatal('data directory not specified')
    }
    if (! await isDir(dataDir)) {
      logger.fatal(`data directory ${colors.dim(dataDir)} does not exist`)
    }

    app.use('/data', serveStatic(dataDir, { fallthrough: false }))

    logger.info(`data at ${colors.dim(`${address}/data/`)} (static -> ${colors.dim(dataDir)})`)
  }
  else if (dataMode === 'proxy') {
    const { dataEndpoint } = config.blog

    const proxyServer = createProxyServer({
      target: dataEndpoint,
      changeOrigin: true,
    })

    app.use('/data', proxyServer.web.bind(proxyServer))

    logger.info(`data at ${colors.dim(`${address}/data/`)} (proxy -> ${colors.dim(dataEndpoint)})`)
  }
  else if (dataMode === 'direct') {
    logger.info(`data at ${colors.dim(config.blog.dataEndpoint)} (direct)`)
  }

  configManager.override({
    blog: {
      dataEndpoint: dataMode === 'direct' ? config.blog.dataEndpoint : `${address}/data/`,
    },
  })

  app.use(viteServer.middlewares)
  viteServer.config.customLogger!.info(`blog at ${colors.dim(address)}`)

  const handleError: Connect.ErrorHandleFunction = (err, req, res, _next) => {
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
    viteServer.config.customLogger!.info('vite server closed')
    server.close()
    logger.info('server closed')

    process.exit(0)
  })

  return { app, server }
}
