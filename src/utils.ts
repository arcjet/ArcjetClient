import { cryptoConfig } from './constants'

// Bytes
export const bytesToStr = (arr: Uint8Array): string => {
  const strArr: string[] = []
  for (let i = 0, ii = arr.length; i < ii; i++) {
    strArr.push(String.fromCharCode(arr[i]))
  }
  return strArr.join('').trim()
}
export const strToBytes = (str: string, len?: number): Uint8Array => {
  const arr = new Uint8Array(len || str.length)
  const pos = len ? len - str.length : 0
  for (let i = 0, ii = len || str.length; i < ii; i++) {
    arr[i] = i >= pos ? str.charCodeAt(i - pos) : 32 // charCode for a space
  }
  return arr
}
export const hexToBytes = (hex: string, len?: number): Uint8Array => {
  const byteArray = new Uint8Array(len || hex.length / 2)
  hex = hex.length % 2 ? '0' + hex : hex
  const offset = len ? len - hex.length / 2 : 0
  for (let c = 0, h = offset; c < hex.length; c += 2, h++) {
    byteArray[h] = parseInt(hex.substr(c, 2), 16)
  }
  return byteArray
}

export const bytesToHex = (arr: Uint8Array): string => {
  const hex: string[] = []
  for (let c = 0; c < arr.length; c++) {
    hex.push(arr[c].toString(16).padStart(2, '0'))
  }
  return hex.join('')
}
export const JSONToBytes = obj => strToBytes(JSON.stringify(obj))
export const bytesToBlob = (arr, type) => new Blob([arr], { type })
export const bytesEquals = (
  bytesA: Uint8Array,
  bytesB: Uint8Array,
): boolean => {
  if (bytesA.length === bytesB.length) {
    for (let i = 0, ii = bytesA.length; i < ii; i++) {
      if (bytesA[i] !== bytesB[i]) {
        return false
      }
    }
    return true
  }
  return false
}

// Crypto
export const digest = async (
  buffer: Uint8Array,
  algo = 'SHA-512',
): Promise<Uint8Array> =>
  new Uint8Array(await crypto.subtle.digest({ name: algo }, buffer))
export const digestStr = async (str, algo): Promise<Uint8Array> =>
  await digest(strToBytes(str), algo)
export const exportKey = key => crypto.subtle.exportKey('jwk', key)
export const importKey = (json, usage) =>
  crypto.subtle.importKey('jwk', json, cryptoConfig, true, [usage])
export const storeKey = (name, jwk) =>
  localStorage.setItem(name, JSON.stringify(jwk))
export const loadKey = (name, usage) =>
  importKey(
    JSON.parse(
      guard(localStorage.getItem(name), `${name} not found in localStorage`),
    ),
    usage,
  )

// Assertions
export const assert = (assertion, message) => {
  if (!assertion) throw new Error(`Assertion Error: ${message}`)
}
export const guard = (value, message) => {
  if (!value) throw new Error(`Assertion Error: ${message}`)
  else return value
}
