import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

const Confirm = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => onClose(false)}
      />

      {/* Modal Content */}
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Confirmer</h3>
          <p className="text-slate-400 font-bold leading-relaxed">{message}</p>
        </div>

        <div className="flex border-t border-slate-800">
          <button
            onClick={() => onClose(false)}
            className="flex-1 p-5 text-slate-500 font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 border-r border-slate-800"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
          <button
            onClick={() => onClose(true)}
            className="flex-1 p-5 text-emerald-500 font-black hover:bg-emerald-500/10 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Valider
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confirm;