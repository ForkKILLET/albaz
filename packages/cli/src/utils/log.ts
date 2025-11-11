import colors from 'picocolors'
import { createLogger as createViteLogger, Logger as ViteLogger, LogType } from 'vite'

export interface LoggerOptions {
  prefix: string
  timeStamp?: boolean
}

const LEVEL_COLOR_MAP = {
  info: 'blue',
  warn: 'yellow',
  error: 'red',
} as const satisfies Record<LogType, string>

export interface Logger extends ViteLogger {
  standard: ViteLogger
}

export const createLogger = ({ prefix, timeStamp = true }: LoggerOptions): Logger => {
  const logger = createViteLogger('info', {
    allowClearScreen: false,
  })

  const formatTimeStamp = timeStamp
    ? () => `${colors.dim(new Date().toISOString())} `
    : () => ''

  const getFormat = (level: LogType) => {
    const header = `${colors.bold(prefix)} [${colors[LEVEL_COLOR_MAP[level]](level[0].toUpperCase())}] `
    return (msg: string) => formatTimeStamp() + header + msg
  }

  const output = (level: LogType) => {
    const format = getFormat(level)
    return (msg: string) => console[level](format(msg))
  }

  const outputStandard = (level: LogType) => {
    const format = getFormat(level)
    return (msg: string, ...args: any[]) => console[level](format(msg), ...args)
  }

  return {
    ...logger,
    info: output('info'),
    warn: output('warn'),
    error: output('error'),
    standard: {
      ...logger,
      info: outputStandard('info'),
      warn: outputStandard('warn'),
      error: outputStandard('error'),
    }
  }
}
