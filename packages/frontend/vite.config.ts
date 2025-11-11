import path from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as R from 'remeda'

import { load as loadTsconfig } from 'tsconfig'
const { config: tsconfig } = await loadTsconfig('.', 'tsconfig.app.json')

export default defineConfig({
  base: './',

  resolve: {
    alias: R.pipe(
      tsconfig.compilerOptions.paths,
      R.entries(),
      R.map(([source, [target]]) => [
        source.replace('/*', ''),
        path.resolve(import.meta.dirname, target.replace('/*', '')),
      ] as const),
      R.fromEntries(),
    )
  },

  plugins: [
    vue(),
  ],
})
