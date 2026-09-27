import React from 'react';
import { X, Beer } from 'lucide-react';

const ModalBoissons = ({ onClose }) => {
  const valider = (id) => {
    onClose(id);
  };

  const boissons = [
    { id: 10, nom: "Coca", color: "bg-[#fe001a]", text: "text-white" },
    { id: 11, nom: "Orangina", color: "bg-[#edd72c]", text: "text-slate-900" },
    { id: 12, nom: "Schweppes", color: "bg-[#ebd65f]", text: "text-slate-900" },
    { id: 13, nom: "Ice Tea", color: "bg-[#923c01]", text: "text-white" },
    { id: 14, nom: "Caprisun", color: "bg-[#21337b]", text: "text-white" },
    { id: 15, nom: "Bière (2€)", color: "bg-[#fce187]", text: "text-slate-900" },
    { id: 16, nom: "Bière locale (3.5€)", color: "bg-[#e67929]", text: "text-white" },
  ];

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in" onClick={() => valider(0)} />

      <div className="relative bg-slate-800 border border-slate-700 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Beer className="text-amber-400 w-5 h-5" />
            Choisir une Boisson
          </h3>
          <button onClick={() => valider(0)} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-3">
          {boissons.map((boisson) => (
            <button
              key={boisson.id}
              onClick={() => valider(boisson.id)}
              className={`${boisson.color} ${boisson.text} h-24 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-center p-2`}
            >
              {boisson.nom}
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

export default ModalBoissons;