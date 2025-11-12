import path from 'node:path'

export const getDistDir = () => {
  return path.resolve(import.meta.dirname, '..', 'dist')
}
