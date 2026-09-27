import React from 'react';
import axios from 'axios';
import { CreditCard, Banknote, PenLine, Landmark, Gift } from 'lucide-react';

const Modal = ({ commande, onClose }) => {

  const valider = async (moyen_paiement) => {
    if (moyen_paiement !== 0) {
      try {
        await axios.post(process.env.REACT_APP_API_URL + "commandes/paiement", { id_commande: commande.id_commande, moyen_paiement: moyen_paiement });
      } catch (error) {
        console.error("Une erreur s'est produite lors de la requête POST :", error);
      }
    }
    onClose(moyen_paiement);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800 rounded-3xl w-full max-w-lg border border-slate-700 shadow-2xl overflow-hidden animate-slide-up">

        {/* Header */}
        <div className="bg-slate-900/50 p-6 border-b border-slate-700 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Encaisser {commande.libelle}</h2>
          <p className="text-5xl font-extrabold text-emerald-400 drop-shadow-lg">{commande.total} €</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => valider("c")}
              className="flex flex-col items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl p-6 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              <CreditCard className="w-10 h-10" />
              <span className="text-xl font-bold">Carte</span>
            </button>

            <button
              onClick={() => valider("m")}
              className="flex flex-col items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl p-6 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              <Banknote className="w-10 h-10" />
              <span className="text-xl font-bold">Espèces</span>
            </button>

            <button
              onClick={() => valider("h")}
              className="flex flex-col items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl p-6 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
            >
              <PenLine className="w-10 h-10" />
              <span className="text-xl font-bold">Chèque</span>
            </button>

            <button
              onClick={() => valider("v")}
              className="flex flex-col items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl p-6 transition-all active:scale-95 shadow-lg shadow-purple-500/20"
            >
              <Landmark className="w-10 h-10" />
              <span className="text-xl font-bold">Virement</span>
            </button>

            <button
              onClick={() => valider("o")}
              className="col-span-2 flex items-center justify-center gap-3 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl p-4 transition-all active:scale-95 shadow-lg shadow-pink-500/20"
            >
              <Gift className="w-8 h-8" />
              <span className="text-xl font-bold">Commande Offerte</span>
            </button>
          </div>

          {/* Cancel */}
          <button
            onClick={() => valider(0)}
            className="w-full py-4 rounded-xl border-2 border-red-500/50 text-red-400 font-bold text-xl hover:bg-red-500/10 hover:border-red-500 transition-colors"
          >
            Annuler
          </button>
        </div>

      </div>
    </div>
  );
};

export default Modal;