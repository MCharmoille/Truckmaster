import { describe, expect, it } from 'vitest'
import { aujourdhui, formatJour, formatJourComplet, jourIso } from '../src/date.js'
import moment from 'moment-timezone'

describe('lecture des dates', () => {
  it('lit un jour calendaire en YYYY-MM-DD', () => {
    expect(jourIso('2026-10-05')).toBe('2026-10-05')
  })

  it('affiche le jour sans l\'année', () => {
    expect(formatJour('2026-10-05')).toBe('lundi 5 octobre')
  })

  it('affiche le jour avec l\'année', () => {
    expect(formatJourComplet('2026-10-05')).toBe('lundi 5 octobre 2026')
  })

  it('prend aujourd\'hui sur le fuseau de la France', () => {
    expect(aujourdhui()).toBe(moment.tz('Europe/Paris').format('YYYY-MM-DD'))
  })
})
