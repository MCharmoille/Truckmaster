import { describe, expect, it } from 'vitest'
import { libelleCourt } from '../src/paiements.js'

describe('moyens de paiement', () => {
  it('donne un libellé court à chaque moyen', () => {
    expect(libelleCourt('c')).toBe('CB')
    expect(libelleCourt('m')).toBe('Esp.')
    expect(libelleCourt('h')).toBe('Chq.')
    expect(libelleCourt('v')).toBe('Vir.')
    expect(libelleCourt('o')).toBe('Offert')
  })
})
