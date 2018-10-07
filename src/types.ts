export interface MetadataBuffer {
  id: Uint8Array
  contentHash: Uint8Array
  metadataHash: Uint8Array
  signature: ArrayBuffer
  publicKey: CryptoKey
}

export interface Metadata {
  publicKey: JsonWebKey
  [k: string]: any
}

export interface Header {
  metadataHash: string
  signature: string
}
