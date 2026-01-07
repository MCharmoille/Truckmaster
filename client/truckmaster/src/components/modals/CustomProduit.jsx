import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  X,
  RefreshCw,
  Plus,
  Minus,
  Euro,
  Utensils,
  CheckCircle2,
  Settings2,
  RotateCcw
} from 'lucide-react';
import CustomSauce from "./CustomSauce";

const ModalCustomProduit = ({ produit, onClose }) => {
  const [recette, setRecette] = useState([]);
  const [prix, setPrix] = useState(produit.prix);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [showCustomSauce, setCustomSauce] = useState(false);

  useEffect(() => {
    const getProduit = async () => {
      try {
        const res = await axios.get(process.env.REACT_APP_API_URL + 'produits/produit?id_produit=' + produit.id_produit);

        const lines = res.data.recette.map((ingredient) => {
          const modif = produit.modifications
            ? produit.modifications.find((i) => i.id_ingredient === ingredient.id_ingredient)
            : null;
          return {
            ...ingredient,
            modificateur: modif ? modif.modificateur : 0,
            nom_affiche: modif ? modif.nom : ingredient.nom
          };
        });
        setRecette(lines);
      } catch (err) {
        console.error("Erreur lors de la récupération de la recette :", err);
      }
    };
    getProduit();
  }, [produit.id_produit, produit.modifications]);

  const modifier_recette = (id, action) => {
    setRecette(prev => prev.map(ing => {
      if (ing.id_ingredient === id) {
        const newModif = Math.min(1, Math.max(-1, ing.modificateur + action));
        return { ...ing, modificateur: newModif };
      }
      return ing;
    }));
  };

  const reset_recette = () => {
    setRecette(prev => prev.map(ing => ({ ...ing, modificateur: 0, nom_affiche: ing.nom })));
    setPrix(produit.prix);
  };

  const valider = () => {
    const modifications = recette
      .filter(ing => ing.modificateur !== 0)
      .map(ing => ({
        id_ingredient: ing.id_ingredient,
        nom: ing.nom_affiche || ing.nom,
        modificateur: ing.modificateur
      }));
    onClose(modifications, prix);
  };

  const CloseCustomSauce = (new_id, new_nom) => {
    setCustomSauce(false);
    if (new_id === 0) return;

    setRecette(prev => prev.map(ing => {
      if (ing.id_ingredient === selectedIngredient) {
        return {
          ...ing,
          id_ingredient: new_id,
          nom_affiche: new_nom,
          modificateur: 2
        };
      }
      return ing;
    }));
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Overlay with subtle blur */}
      <div
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => onClose(produit.modifications, produit.prix)}
      />

      {/* Modal Content */}
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Header Section */}
        <div className="p-8 pb-6 border-b border-white/5 bg-gradient-to-b from-slate-800/50 to-transparent">
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-[1.5rem] flex items-center justify-center border border-emerald-500/20">
                <Settings2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-1">
                  Ajuster
                </h2>
                <p className="text-slate-400 font-bold text-sm flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5" />
                  {produit.nom}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={reset_recette}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all text-slate-400 hover:text-white"
                title="Réinitialiser"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={() => onClose(produit.modifications, produit.prix)}
                className="p-3 bg-slate-800 hover:bg-red-500 transition-all text-slate-400 hover:text-white rounded-2xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area (More compact) */}
        <div className="px-6 py-4 max-h-[55vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recette.map((ingredient, index) => (
              <div
                key={index}
                className={`relative p-3 rounded-2xl border transition-all duration-300 group ${ingredient.modificateur === -1 ? 'bg-red-500/5 border-red-500/20 shadow-lg shadow-red-500/5' :
                    ingredient.modificateur === 1 ? 'bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-500/5' :
                      ingredient.modificateur === 2 ? 'bg-orange-500/5 border-orange-500/20 shadow-lg shadow-orange-500/5' :
                        'bg-slate-800/30 border-white/5 hover:border-white/10'
                  }`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex-1">
                    <span className={`block font-black uppercase tracking-widest text-[9px] mb-0.5 leading-none ${ingredient.modificateur === -1 ? 'text-red-400' :
                        ingredient.modificateur === 1 ? 'text-emerald-400' :
                          ingredient.modificateur === 2 ? 'text-orange-400' :
                            'text-slate-500'
                      }`}>
                      {ingredient.modificateur === -1 ? "Supprimé" :
                        ingredient.modificateur === 1 ? "Supplément" :
                          ingredient.modificateur === 2 ? "Modifié" : "Ingrédient"}
                    </span>
                    <h4 className={`text-sm font-black transition-colors ${ingredient.modificateur === 0 ? 'text-slate-100' : 'text-white'
                      }`}>
                      {ingredient.nom_affiche || ingredient.nom}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => modifier_recette(ingredient.id_ingredient, -1)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${ingredient.modificateur === -1
                            ? 'bg-red-500 text-white shadow-lg'
                            : 'bg-slate-800 text-red-500 border border-slate-700 hover:bg-red-500/10'
                          }`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => modifier_recette(ingredient.id_ingredient, 1)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${ingredient.modificateur === 1
                            ? 'bg-emerald-500 text-slate-900 shadow-lg'
                            : 'bg-slate-800 text-emerald-500 border border-slate-700 hover:bg-emerald-500/10'
                          }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {ingredient.gestion_sauce === 1 && (
                      <button
                        onClick={() => { setSelectedIngredient(ingredient.id_ingredient); setCustomSauce(true); }}
                        className="h-9 px-3 bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white border border-orange-500/20 rounded-lg transition-all flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-widest"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Sauce
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Footer Section */}
        <div className="p-8 bg-slate-950/50 border-t border-white/5">
          <div className="flex flex-col sm:flex-row gap-8 items-end sm:items-center">
            <div className="flex-1 w-full sm:w-auto">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 block px-1">
                Ajustement du Prix
              </label>
              <div className="flex items-center gap-4 bg-slate-900 rounded-3xl px-6 py-4 border border-white/5 focus-within:border-amber-500/50 focus-within:bg-amber-500/5 transition-all group">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-focus-within:text-amber-400 transition-colors">
                  <Euro className="w-6 h-6" />
                </div>
                <input
                  type="number"
                  step="0.1"
                  className="bg-transparent border-none outline-none flex-1 font-mono font-black text-2xl text-white placeholder:text-slate-800"
                  placeholder={produit.prix}
                  value={prix}
                  onChange={(e) => setPrix(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={valider}
              className="w-full sm:w-auto min-w-[200px] h-[72px] bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 group"
            >
              <span className="group-hover:translate-x-1 transition-transform flex items-center gap-3">
                Valider la Recette
                <CheckCircle2 className="w-6 h-6" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {showCustomSauce && (
        <CustomSauce onClose={CloseCustomSauce} />
      )}
    </div>
  );
};

export default ModalCustomProduit;