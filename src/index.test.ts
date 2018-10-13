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

const mockFetchResponse = (status: number) =>
  ((global as any).fetch = jest.fn().mockResolvedValue({
    status,
  }))

describe('Integration', () => {
  it('can get a record from the network, sign, and verify it', async () => {
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

  it('can set a record from the network, and receive a record', async () => {
    mockFetchResponse(200)
    const api = new Arcjet()
    await api.generate()
    const record = await api.set(new Uint8Array([127, 0, 0, 1]), 'text/plain', {
      test: 'test',
    })
    await record.verify()
    expect(record.metadata.contentHash).toEqual(
      '9f9ab00bda6cb55b87554fb3547dc06d58a90e7e58473fe179ab6eb95d61eb7aedb8b31c2190911554258b62ece60a8863c729a651001da45b3053907ee2ebc5',
    )
  })
})
