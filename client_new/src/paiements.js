export const MOYENS_PAIEMENT = [
  { code: 'c', court: 'CB', libelle: 'Carte' },
  { code: 'm', court: 'Esp.', libelle: 'Espèces' },
  { code: 'h', court: 'Chq.', libelle: 'Chèque' },
  { code: 'v', court: 'Vir.', libelle: 'Virement' },
  { code: 'o', court: 'Offert', libelle: 'Commande Offerte' },
]

export function libelleCourt(code) {
  return MOYENS_PAIEMENT.find((moyen) => moyen.code === code)?.court ?? code
}
