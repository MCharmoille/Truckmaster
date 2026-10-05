import { describe, expect, it } from 'vitest'
import { APP_NAME } from './appName.js'

describe('GeckoFT', () => {
  it('expose le nom de l’application', () => {
    expect(APP_NAME).toBe('GeckoFT')
  })
})
