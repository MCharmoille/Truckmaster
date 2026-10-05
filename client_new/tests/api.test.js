import { beforeEach, describe, expect, it } from 'vitest'
import { logout, setUnauthorizedHandler } from '../src/api.js'

function installLocalStorage() {
  const store = new Map()
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  }
}

describe('logout', () => {
  beforeEach(() => {
    installLocalStorage()
    setUnauthorizedHandler(() => {})
  })

  it('efface la session et prévient l’application', () => {
    localStorage.setItem('authToken', 'jeton')
    localStorage.setItem('user', 'Maxime')
    localStorage.setItem('userId', '1')

    let called = false
    setUnauthorizedHandler(() => {
      called = true
    })

    logout()

    expect(localStorage.getItem('authToken')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
    expect(localStorage.getItem('userId')).toBeNull()
    expect(called).toBe(true)
  })
})
