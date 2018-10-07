import { exportKey, storeKey, bytesToBlob } from './utils'
import { cryptoConfig } from './constants'
import { Record } from './record'

export class Arcjet {
  host: string
  site: string

  constructor() {
    this.host = 'http://localhost:8000'
    this.site = window.location.hostname
  }

  async generate() {
    try {
      const key = await window.crypto.subtle.generateKey(cryptoConfig, true, [
        'sign',
        'verify',
      ])
      const { publicKey, privateKey } = key
      const pubkey = await exportKey(publicKey)
      const privkey = await exportKey(privateKey)
      storeKey('ARCJET_PUBLIC_KEY', pubkey)
      storeKey('ARCJET_SECRET_KEY', privkey)
    } catch (err) {
      console.error(err)
      throw new Error('Crypto key generation error')
    }
  }

  async get(contentHash, type, metadata): Promise<Record> {
    try {
      const res = await fetch(`${this.host}/store/${contentHash}`)
      if (res.status === 200) {
        const bytes = await res.arrayBuffer()
        return new Record(new Uint8Array(bytes), type, metadata)
      } else {
        throw new Error('Failed to fetch')
      }
    } catch (err) {
      console.error(err)
      throw new Error(err)
    }
  }

  async set(content, type, metadata) {
    try {
      const record = new Record(content, type, metadata)

      await record.sign()

      // Set the content in the store
      await fetch(`${this.host}/store`, {
        method: 'POST',
        body: bytesToBlob(record.content, record.type),
      })

      // Set the metadata in the index
      await fetch(`${this.host}/index`, {
        method: 'POST',
        body: JSON.stringify({
          metadata: record.metadata,
          header: record.header,
        }),
      })

      return record
    } catch (err) {
      console.error(err)
      throw new Error(err)
    }
  }

  async find(query) {
    try {
      const res = await fetch(`${this.host}/find`, {
        method: 'POST',
        body: query,
      })

      const results = await res.json()

      const records = results.map(result =>
        this.get(result.contentHash, result.type, result),
      )

      return Promise.all(records)
    } catch (err) {
      console.error(err)
      throw new Error(err)
    }
  }
}
