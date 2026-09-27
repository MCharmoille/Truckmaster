import React from 'react';
import { X, Flame } from 'lucide-react';

const CustomSauce = ({ onClose }) => {
  const valider = (id, nom) => {
    onClose(id, nom);
  };

  const sauces = [
    { id: 11, nom: "Ketchup", color: "bg-[#a82d1f]", text: "text-white" },
    { id: 21, nom: "Mayonnaise", color: "bg-[#fcf7e2]", text: "text-slate-900" },
    { id: 12, nom: "Moutarde", color: "bg-[#ebd65f]", text: "text-slate-900" },
    { id: 22, nom: "Samouraï", color: "bg-orange-500", text: "text-white" },
    { id: 35, nom: "Sauce blanche", color: "bg-[#f5f5f5]", text: "text-slate-900" },
    { id: 36, nom: "Moutarde à l'ancienne", color: "bg-[#d1b16f]", text: "text-slate-900" },
    { id: 37, nom: "Sauce algérienne", color: "bg-[#b5651d]", text: "text-white" },
    { id: 38, nom: "Sauce barbecue", color: "bg-[#4b2e1a]", text: "text-white" },
    { id: 42, nom: "Sauce burger", color: "bg-[#c85019]", text: "text-white" },
  ];

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in" onClick={() => valider(0)} />

      <div className="relative bg-slate-800 border border-slate-700 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Flame className="text-orange-500 w-5 h-5" />
            Choisir une Sauce
          </h3>
          <button onClick={() => valider(0)} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-3">
          {sauces.map((sauce) => (
            <button
              key={sauce.id}
              onClick={() => valider(sauce.id, sauce.nom)}
              className={`${sauce.color} ${sauce.text} h-24 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-center p-2`}
            >
              {sauce.nom}
            </button>
          ))}
        </div>

        <div className="p-6 bg-slate-900/50">
          <button
            onClick={() => valider(0)}
            className="w-full py-4 text-slate-400 font-bold hover:text-white transition-colors uppercase tracking-widest text-xs"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomSauce;