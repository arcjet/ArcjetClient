import { cryptoConfigSig } from './constants'
import {
  assert,
  loadKey,
  digest,
  hexToBytes,
  bytesToHex,
  bytesEquals,
  JSONToBytes,
  exportKey,
  importKey,
} from './utils'
import { Metadata, Header } from './types'

export class Record {
  metadata: Metadata
  header: Header
  content: Uint8Array
  record: Uint8Array
  type: string
  id: string

  constructor(content: Uint8Array, type: string, metadata: any) {
    if (metadata) this.metadata = metadata
    if (content) this.content = content
    if (type) this.type =  type
  }

  async sign() {
    assert(
      this.content && this.content.length > 0,
      'There must be content in the record to sign',
    )
    assert(this.content instanceof Uint8Array, 'Content must be an ArrayBuffer')

    const publicKey = await loadKey('ARCJET_PUBLIC_KEY', 'verify')
    const privateKey = await loadKey('ARCJET_SECRET_KEY', 'sign')

    const contentHash = await digest(this.content)

    this.metadata = {
      contentHash: bytesToHex(contentHash),
      publicKey: await exportKey(publicKey),
    }

    const metadataHash = await digest(JSONToBytes(this.metadata))

    const metadataContentBytes = new Uint8Array([
      ...contentHash,
      ...metadataHash,
    ])

    const signature = await crypto.subtle.sign(
      cryptoConfigSig,
      privateKey,
      metadataContentBytes,
    )

    this.header = {
      metadataHash: bytesToHex(metadataHash),
      signature: bytesToHex(new Uint8Array(signature)),
    }

    const partialRecord = new Uint8Array([
      ...metadataContentBytes,
      ...JSONToBytes(this.header)
    ])

    const id = await digest(partialRecord)

    const record = new Uint8Array([...id, ...partialRecord])

    // Format: [idHash, signature, hexToBytes(contentHash, metadata)...] + [content]
    this.record = record
    this.id = bytesToHex(id)
  }

  async verify() {
    const contentHash = await digest(this.content)
    const metadataHash = await digest(JSONToBytes(this.metadata))

    const metadataContentBytes = new Uint8Array([
      ...contentHash,
      ...metadataHash,
    ])

    assert(
      bytesToHex(contentHash) === this.metadata.contentHash,
      'Content matches hash',
    )
    assert(
      bytesToHex(metadataHash) === this.header.metadataHash,
      'Metadata matches hash',
    )

    const isValid = await crypto.subtle.verify(
      cryptoConfigSig,
      await importKey(this.metadata.publicKey, 'verify'),
      hexToBytes(this.header.signature),
      metadataContentBytes,
    )

    assert(isValid, 'Record has a valid signature')

    const partialRecord = new Uint8Array([
      ...metadataContentBytes,
      ...JSONToBytes(this.header)
    ])

    const id = await digest(partialRecord)

    assert(
      bytesEquals(id, hexToBytes(this.id)),
      'Record ID matches hash',
    )
  }
}
