import { Command, Option } from 'commander'
import { version } from '../package.json'
import { dev } from './commands/dev'
import { build } from './commands/build'
import { preview } from './commands/preview'

const cli = new Command()

cli
  .name('albaz')
  .description('Albaz CLI')
  .version(version)

cli
  .command('dev')
  .description('start dev server')
  .addOption(new Option('-H, --host <host>', 'Specify hostname')
    .default('localhost')
  )
  .addOption(new Option('-p, --port <port>', 'Specify port')
    .argParser(parseInt)
    .default(1800)
  )
  .addOption(new Option('-m, --data-mode <mode>', 'Specify data serving mode')
    .choices(['proxy', 'static', 'direct'])
    .default('proxy')
  )
  .addOption(new Option('-d, --data-dir <path>', 'Specify data directory'))
  .action(dev)

cli
  .command('build')
  .description('build production assets')
  .action(build)

cli
  .command('preview')
  .description('locally preview production build')
  .addOption(new Option('-H, --host <host>', 'Specify hostname')
    .default('localhost')
  )
  .addOption(new Option('-p, --port <port>', 'Specify port')
    .argParser(parseInt)
    .default(1801)
  )
  .addOption(new Option('-m, --data-mode <mode>', 'Specify data serving mode')
    .choices(['proxy', 'static', 'direct'])
    .default('proxy')
  )
  .addOption(new Option('-d, --data-dir <path>', 'Specify data directory'))
  .action(preview)

cli.parseAsync()
