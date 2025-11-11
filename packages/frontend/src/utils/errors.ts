import type { ZodError } from 'zod'

export class PostNotFoundError extends Error {
  name = 'PostNotFoundError'

  constructor(file: string) {
    super(`Post not found: ${file}`)
  }
}

export type AllError =
  | PostNotFoundError
  | ZodError
  | Error
