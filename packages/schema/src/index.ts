import z from 'zod'

export const DevConfig = z
  .object({
    dataDir: z.string().optional(),
  })
  .prefault({})
export type DevConfig = z.infer<typeof DevConfig>

export const BlogConfig = z
  .object({
    blogTitle: z.string().default('My Albaz Blog'),
    dataEndpoint: z.string().default('./data'),
  })
  .prefault({})
export type BlogConfig = z.infer<typeof BlogConfig>

export const Config = z
  .object({
    blog: BlogConfig,
    dev: DevConfig,
  })
  .prefault({})
export type Config = z.infer<typeof Config>

export const PostMeta = z.object({
  file: z.string(),
  title: z.string(),
  summary: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  tags: z.array(z.string()),
})
export type PostMeta = z.infer<typeof PostMeta>

export const PostIndex = z.object({
  posts: z.array(PostMeta),
})
export type PostIndex = z.infer<typeof PostIndex>

export const PostContent = z.object({
  text: z.string(),
})
export type PostContent = z.infer<typeof PostContent>
