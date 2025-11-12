import { Direction } from 'node:tty'
import nodeUtil from 'node:util'

import colors from 'picocolors'
import stripAnsi from 'strip-ansi'
import * as Vite from 'vite'

export interface LoggerOptions {
  topic: string
  timeStamp?: boolean
}

export type LogType = Vite.LogType

const LEVEL_COLOR_MAP = {
  info: 'blue',
  warn: 'yellow',
  error: 'red',
} as const satisfies Record<LogType, string>

export interface Logger extends Vite.Logger {
  fatal: (msg: string) => never
  task: <T>(msg: string, task: () => Promise<T>) => Promise<T>
}

const createCursorHook = () => {
  const self = {
    currentPrefixWidth: 0,
    cursorTo: process.stdout.cursorTo.bind(process.stdout),
    clearLine: process.stdout.clearLine.bind(process.stdout),
  }

  process.stdout.cursorTo = x => self.cursorTo(self.currentPrefixWidth + x)

  process.stdout.clearLine = (dir: Direction) => {
    if (dir === 0) {
      self.cursorTo(self.currentPrefixWidth)
      return self.clearLine(1)
    }
    else if (dir === 1) {
      return self.clearLine(1)
    }
    else {
      return false
    }
  }

  return self
}

const cursorHook = process.stdout.isTTY ? createCursorHook() : null

export const createLogger = ({ topic }: LoggerOptions): Logger => {
  const viteLogger = Vite.createLogger('info', {
    allowClearScreen: false,
  })

  const formatTimeStamp = () => `${colors.dim(new Date().toISOString())} `

  const getFormat = (level: LogType) => {
    const header = `${colors.bold(topic)} [${colors[LEVEL_COLOR_MAP[level]](level[0].toUpperCase())}] `
    return (msg: string) => formatTimeStamp() + header + msg
  }

  const { length: prefixWidth } = stripAnsi(getFormat('info')(''))
  const newlinePadding = '\n' + ' '.repeat(prefixWidth)

  const getOutput = (level: LogType) => {
    const format = getFormat(level)
    return (msg: string) => {
      if (cursorHook) {
        cursorHook.currentPrefixWidth = prefixWidth
        cursorHook.cursorTo(0)
      }
      console[level](format(msg))
    }
  }

  const getOutputM = (level: LogType) => {
    const output = getOutput(level)
    return (msg: string) => output(msg.trim().replace(/\n/g, newlinePadding))
  }

  const info = getOutputM('info')
  const warn = getOutputM('warn')
  const error = getOutputM('error')

  const fatal: (msg: string) => never = msg => {
    error(msg)
    process.exit(1)
  }

  const task = async <T>(msg: string, task: () => Promise<T>): Promise<T> => {
    info(`${msg}...`)
    try {
      return await task()
    }
    catch (err) {
      fatal(`error ${msg}:\n${err}`)
    }
  }

  const logger: Logger = {
    ...viteLogger,
    info,
    warn,
    error,
    fatal,
    task,
  }

  return logger
}

export const logger: Logger = createLogger({ topic: colors.whiteBright('albaz') })

export const viteLogger: Logger = createLogger({ topic: colors.cyan('vite ') })
