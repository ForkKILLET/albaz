import { PostIndex, PostContent, PostMeta } from '@albaz/schema'

import { Bound } from '@util/decorators'
import { fetcher } from '@store/fetcher'
import { PostNotFoundError } from '@util/errors'

export class PostStore {
  static { Bound(PostStore) }

  postIndex: PostIndex | null = null
  postMetas: Record<string, PostMeta> = {}
  postContents: Record<string, PostContent> = {}

  async fetchPostIndex(): Promise<PostIndex> {
    const index = await fetcher.fetchJson<PostIndex>('/@albaz/index.json').then(PostIndex.parse)
    index.posts.forEach(post => {
      this.postMetas[post.file] = post
    })
    return index
  }

  async fetchPostContent(slug: string): Promise<PostContent> {
    const text = await fetcher.fetchText(`/${slug}`)
    const content = PostContent.parse({ text })
    return content
  }

  async getPostIndex(): Promise<PostIndex> {
    return this.postIndex ??= await this.fetchPostIndex()
  }

  async getPostMeta(file: string): Promise<PostMeta> {
    await this.getPostIndex()
    const meta = this.postMetas[file]
    if (! meta) throw new PostNotFoundError(file)
    return meta
  }

  async getPostContent(file: string): Promise<PostContent> {
    return this.postContents[file] ??= await this.fetchPostContent(file)
  }
}

export const blogStore = new PostStore()
