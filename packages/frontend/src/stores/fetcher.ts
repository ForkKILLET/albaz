import { config } from '@store/config'
import { Bound } from '@util/decorators'

export class Fetcher {
  static { Bound(Fetcher) }

  async fetch(url: string) {
    return fetch(`${config.dataEndpoint}${url}`)
  }

  async fetchJson<T>(url: string): Promise<T> {
    const res = await this.fetch(url)
    return res.json() as Promise<T>
  }

  async fetchText(url: string): Promise<string> {
    const res = await this.fetch(url)
    return res.text()
  }
}

export const fetcher = new Fetcher()
