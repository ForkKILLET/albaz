import { Command, Option } from 'commander'
import { version } from '../package.json'
import { dev } from './commands/dev'
import { build } from './commands/build'
import { preview } from './commands/preview'
import { export_ } from './commands/export'

const cli = new Command()
  .name('albaz')
  .description('Albaz CLI')
  .version(version)

const hostOption = new Option('--host <host>', 'hostname')
  .default('localhost')

const portOption = new Option('-p, --port <port>', 'port number')
  .argParser(str => parseInt(str))

const dataModeOption = new Option('--data-mode <mode>', 'data serving mode')
  .choices(['static', 'direct', 'proxy'])

const dataDirOption = new Option('-d, --data-dir <path>', 'data directory')

const distModeOption = new Option('--dist-mode <mode>', 'dist mode')
  .choices(['prebuilt', 'local', 'vite'])
  .default('auto')

cli
  .command('dev')
  .description('start dev server')
  .addOption(hostOption)
  .addOption(portOption.default(1800))
  .addOption(dataModeOption.default('static'))
  .addOption(dataDirOption)
  .action(dev)

cli
  .command('build')
  .description('build production assets')
  .action(build)

cli
  .command('preview')
  .description('locally preview production build')
  .addOption(hostOption)
  .addOption(portOption.default(1801))
  .addOption(dataModeOption.default('direct'))
  .addOption(dataDirOption)
  .addOption(distModeOption)
  .action(preview)

cli
  .command('export')
  .description('export static site from prebuilt dist')
  .action(export_)

cli.parseAsync()
