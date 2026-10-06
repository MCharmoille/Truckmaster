import { useRef, useState } from 'react';
import { Banknote, CreditCard, Gift, Landmark, PenLine } from 'lucide-react';
import { MOYENS_PAIEMENT } from '../../paiements.js';
import { api } from '../../api.js';

const BOUTON = 'flex flex-col items-center justify-center gap-2 text-white rounded-2xl p-6 transition-all active:scale-95 shadow-lg';

const APPARENCE = {
  c: { icon: CreditCard, className: `${BOUTON} bg-blue-600 hover:bg-blue-500 shadow-blue-500/20` },
  m: { icon: Banknote, className: `${BOUTON} bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20` },
  h: { icon: PenLine, className: `${BOUTON} bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20` },
  v: { icon: Landmark, className: `${BOUTON} bg-purple-600 hover:bg-purple-500 shadow-purple-500/20` },
  o: {
    icon: Gift,
    className: 'col-span-2 flex items-center justify-center gap-3 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl p-4 transition-all active:scale-95 shadow-lg shadow-pink-500/20',
    petiteIcone: true,
  },
};

const Paiement = ({ commande, onClose }) => {
  const [enCours, setEnCours] = useState(false);
  const verrou = useRef(false);

  const valider = async (moyen_paiement) => {
    if (moyen_paiement === 0) {
      onClose(moyen_paiement);
      return;
    }
    if (verrou.current) return;
    verrou.current = true;
    setEnCours(true);

    try {
      await api.post("commandes/paiement", { id_commande: commande.id_commande, moyen_paiement: moyen_paiement });
      onClose(moyen_paiement);
    } catch (error) {
      console.error("Une erreur s'est produite lors de la requête POST :", error);
      alert("L'encaissement n'a pas pu être enregistré. Réessayez.");
      verrou.current = false;
      setEnCours(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-3xl w-full max-w-lg border border-slate-700 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-slate-900/50 p-6 border-b border-slate-700 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Encaisser {commande.libelle}</h2>
          <p className="text-5xl font-extrabold text-emerald-400 drop-shadow-lg">{commande.total} €</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {MOYENS_PAIEMENT.map((moyen) => {
              const apparence = APPARENCE[moyen.code];
              const Icon = apparence.icon;
              return (
                <button
                  key={moyen.code}
                  type="button"
                  onClick={() => valider(moyen.code)}
                  disabled={enCours}
                  className={`${apparence.className} disabled:opacity-50`}
                >
                  <Icon className={apparence.petiteIcone ? 'w-8 h-8' : 'w-10 h-10'} />
                  <span className="text-xl font-bold">{moyen.libelle}</span>
                </button>
              );
            })}
          </div>

          {/* Cancel */}
          <button
            type="button"
            onClick={() => valider(0)}
            disabled={enCours}
            className="w-full py-4 rounded-xl border-2 border-red-500/50 text-red-400 font-bold text-xl hover:bg-red-500/10 hover:border-red-500 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
        </div>

      </div>
    </div>
  );
};

export default Paiement;
