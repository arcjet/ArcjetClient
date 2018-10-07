import { Arcjet } from './arcjet'
// import { TextEncoder, TextDecoder } from 'util'

// const mockFetchJSON = (status: number, value: {}) =>
//   ((global as any).fetch = jest.fn().mockResolvedValue({
//     status,
//     json: jest.fn().mockResolvedValue(value)
//   }))

;(global as any).crypto = require('@trust/webcrypto')
// ;(global as any).TextEncoder = TextEncoder
// ;(global as any).TextDecoder = TextDecoder

const mockFetchArrayBuffer = (status: number, value: Uint8Array) =>
  ((global as any).fetch = jest.fn().mockResolvedValue({
    status,
    arrayBuffer: jest.fn().mockResolvedValue(value),
  }))

describe('Integration', () => {
  it('can get a record from the server, sign, and verify it', async () => {
    const fetch = mockFetchArrayBuffer(200, new Uint8Array([127, 0, 0, 1]))
    const api = new Arcjet()
    await api.generate()
    const record = await api.get('testhash123', 'text/plain', {})
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/store/testhash123',
    )
    await record.sign()
    await record.verify()
  })
})
