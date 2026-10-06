import moment from 'moment-timezone'

const FUSEAU = 'Europe/Paris'

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

moment.tz.setDefault(FUSEAU)

const CLE_JOUR = 'jourCaisse'
const CLE_PERIODES = 'periodesCaisse'
const EVENT_PERIODES = 'periodes-caisse'

function momentParis(date) {
  return moment.tz(jourIso(date), 'YYYY-MM-DD', FUSEAU)
}

function libelleJour(date, avecAnnee) {
  const m = momentParis(date)
  const libelle = `${JOURS[m.day()]} ${m.date()} ${MOIS[m.month()]}`
  return avecAnnee ? `${libelle} ${m.year()}` : libelle
}

export function aujourdhui() {
  return moment.tz(FUSEAU).format('YYYY-MM-DD')
}

export function jourIso(date) {
  if (date == null || date === '') return ''
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2} /.test(date)) return date.slice(0, 10)
  return moment(date).tz(FUSEAU).format('YYYY-MM-DD')
}

export function formatJour(date) {
  return libelleJour(date, false)
}

export function formatJourComplet(date) {
  return libelleJour(date, true)
}

export function datePourCalendrier(date) {
  const [year, month, day] = jourIso(date).split('-').map(Number)
  return new Date(year, month - 1, day, 12, 0, 0)
}

export function memoriserJour(date) {
  const iso = jourIso(date)
  sessionStorage.setItem(CLE_JOUR, iso)
  return iso
}

export function lireJour() {
  if (typeof sessionStorage === 'undefined') return null
  return sessionStorage.getItem(CLE_JOUR)
}

export function periodeOuverte(valeur) {
  return valeur === 1 || valeur === true || valeur === '1'
}

export function memoriserPeriodes(midi, soir) {
  const periodes = { midi: periodeOuverte(midi), soir: periodeOuverte(soir) }
  sessionStorage.setItem(CLE_PERIODES, JSON.stringify(periodes))
  window.dispatchEvent(new Event(EVENT_PERIODES))
}

export function periodesFermees() {
  if (typeof sessionStorage === 'undefined') return false
  const brut = sessionStorage.getItem(CLE_PERIODES)
  if (!brut) return false
  try {
    const periodes = JSON.parse(brut)
    return !periodes.midi && !periodes.soir
  } catch {
    return false
  }
}

export function souscrirePeriodes(auditeur) {
  window.addEventListener(EVENT_PERIODES, auditeur)
  return () => window.removeEventListener(EVENT_PERIODES, auditeur)
}
