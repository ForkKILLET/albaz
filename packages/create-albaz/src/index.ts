import path from 'node:path'
import fs from 'node:fs'
import fsp from 'node:fs/promises'

import * as prompts from '@clack/prompts'
import colors from 'picocolors'
import { Command, Option } from '@commander-js/extra-typings'
import { glob } from 'glob'
import { execa } from 'execa'
import { SpawnOptions } from 'node:child_process'

const DEFAULT_PROJECT_NAME = 'albaz-project'

const TEMPLATE_NAMES = ['prebuilt'] as const
type TemplateName = typeof TEMPLATE_NAMES[number]

const TEMPLATE_FILENAME_MAP: Record<string, string> = {
  '_gitignore': '.gitignore',
}

const cli = new Command()
  .name('create-albaz')
  .description('Create a new Albaz project')
  .version('0.1.0')
  .argument('[project-path]', 'path of the new Albaz project')
  .addOption(new Option('-t, --template <template>', 'specify project template')
    .choices(['prebuilt'])
  )
  .action(async (projectPathArg, options) => {
    prompts.intro(colors.bold(colors.whiteBright('Creating Albaz project')))

    const projectDir = normalizePath(projectPathArg ?? await prompts
      .text({
        message: 'Project path',
        defaultValue: DEFAULT_PROJECT_NAME,
        placeholder: DEFAULT_PROJECT_NAME,
      })
      .then(handleCancel)
    )

    const blogName = await prompts
      .text({
        message: 'Blog name',
        defaultValue: 'My Albaz Blog',
        placeholder: 'Blog name',
      })
      .then(handleCancel)

    const template: TemplateName = options.template ?? await prompts
      .select({
        message: 'Project template',
        options: [
          { value: 'prebuilt', label: 'Prebuilt' },
        ],
      })
      .then(handleCancel)

    const projectDirExists = await new Promise((resolve, reject) =>
      fs.stat(projectDir, (err, stats) => {
        if (err) {
          if (err.code === 'ENOENT') resolve(false)
          reject(err)
        }
        else if (! stats.isDirectory()) {
          exit('Project path exists and is not a directory.')
        }
        else {
          resolve(true)
        }
      })
    )

    if (projectDirExists) {
      const doOverwrite = await prompts
        .confirm({
          message: 'Project directory already exists. Continue?'
        })
        .then(handleCancel)
      if (! doOverwrite) cancel()
    }
    else {
      await fsp.mkdir(projectDir, { recursive: true })
    }

    const templateDir = path.join(import.meta.dirname, '..', 'templates')

    await task(
      `Scaffolding project in ${colors.green(projectDir)}`,
      async () => {
        const projectTemplateDir = path.join(templateDir, template)
        for (const srcPath of await glob(`${projectTemplateDir}/*`)) {
          const filename = path.basename(srcPath)
          const filenameMapped = TEMPLATE_FILENAME_MAP[filename] ?? filename
          const destPath = path.resolve(projectDir, filenameMapped)

          if (filename === 'albaz.config.yaml') {
            const content = await fsp.readFile(srcPath, 'utf8')
              .then(content => content.replace(/__BLOG_NAME__/g, blogName))
            await fsp.writeFile(destPath, content, 'utf8')
            continue
          }
          await fsp.cp(srcPath, destPath, { recursive: true })
        }

        return 'Scaffolded project'
      }
    )

    const doCreateDataDir = await prompts
      .confirm({
        message: 'Create example data directory?',
        initialValue: true,
      })
      .then(handleCancel)

    if (doCreateDataDir) {
      await task(
        'Create example data directory',
        async () => {
          const dataTemplateDir = path.join(templateDir, 'data')
          const dataDir = path.join(projectDir, 'data')
          await fsp.mkdir(dataDir, { recursive: true })
          for (const file of await glob(`${dataTemplateDir}/*`)) {
            const filename = path.basename(file)
            const destPath = path.join(dataDir, filename)

            if (filename === '@albaz') {
              await fsp.mkdir(destPath)
              for (const srcPath of await glob(`${dataTemplateDir}/@albaz/*`)) {
                const content = await fsp.readFile(srcPath, 'utf8')
                  .then(content => content.replace(/__NOW__/g, new Date().toISOString()))
                const filename = path.basename(srcPath)
                const destPath = path.join(dataDir, '@albaz', filename)
                await fsp.writeFile(destPath, content, 'utf8')
              }
              continue
            }
            await fsp.cp(file, destPath, { recursive: true })
          }

          return 'Created example data directory'
        }
      )
    }

    const doInstall = await prompts
      .confirm({
        message: 'Install dependencies now?',
      })
      .then(handleCancel)

    const pmInfo = getPmInfo()

    if (doInstall) {
      if (! pmInfo) exit('Could not detect package manager.')

      await task(
        `Installing dependencies with ${colors.green(pmInfo.name)}...`,
        async () => {
          await execa(pmInfo.name, ['install'], { cwd: projectDir })
          return 'Installed dependencies'
        }
      )

      const doPreview = doCreateDataDir && await prompts
        .confirm({
          message: 'Preview the blog now?',
        })
        .then(handleCancel)

      if (doPreview) {
        prompts.log.step('Running development server')

        await execa(pmInfo.name, ['run', 'preview:static'], { cwd: projectDir, stdio: 'inherit' })
        process.exit(0)
      }
    }

    if (doCreateDataDir) {
      const suggestionCommands: string[] = []

      suggestionCommands.push(`cd ${escapeShellArg(projectDir)}`)

      const pmName = pmInfo?.name ?? '<package-manager>'
      if (! doInstall) suggestionCommands.push(`${pmName} install`)
      suggestionCommands.push(`${pmName} run preview:static`)

      prompts.outro(
        'Done. Run the following commands to try your fresh blog!\n\n' +
        suggestionCommands
          .map(command => `$ ${colors.green(command)}`)
          .join('\n'),
      )
    }
  })

cli.parse()

function exit(message: string, code: number = 1): never {
  prompts.cancel(message)
  process.exit(code)
}

function cancel(): never {
  exit('Operation cancelled.', 0)
}

function handleCancel<T>(value: T | symbol): T {
  if (prompts.isCancel(value)) cancel()
  return value
}

async function task(titleWorking: string, taskFn: () => Promise<string>): Promise<void> {
  const spinner = prompts.spinner({ indicator: 'timer' })
  spinner.start(titleWorking)
  const titleDone = await taskFn()
  spinner.stop(titleDone)
}

function normalizePath(pathname: string): string {
  pathname = pathname.trim()
  if (! pathname) exit('Invalid path.')
  return path.normalize(pathname)
}

interface PmInfo {
  name: string
  version: string
}

function getPmInfo(): PmInfo | null {
  const userAgent = process.env.npm_config_user_agent
  if (! userAgent) return null

  const first = userAgent.split(' ')[0]
  const [name, version] = first.split('/')
  return {
    name,
    version,
  }
}

function showError(err: any): string {
  return err instanceof Error
    ? err.stack ?? err.message
    : String(err)
}

function escapeShellArg(arg: string): string {
  if (! arg || /[ $<>!#$%^&*{}\\]/.test(arg)) return `'${arg}'`
  return arg
}
