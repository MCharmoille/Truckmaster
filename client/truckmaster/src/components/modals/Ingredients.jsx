import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, X } from 'lucide-react';

const Ingredients = ({ isOpen, onClose, onAddIngredient }) => {
  const [ingredients, setIngredients] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [newIngredientName, setNewIngredientName] = useState('');

  useEffect(() => {
    const getIngredients = async () => {
      try {
        const res = await axios.get(process.env.REACT_APP_API_URL + 'ingredients');

        setIngredients(res.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des ingrédients:', err);
      }
    };
    getIngredients();
  }, []);

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.nom.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleCreateIngredient = async () => {
    if (!newIngredientName.trim()) return;

    try {
      // 1. Enregistrement du nouvel ingrédient dans la bd
      const res = await axios.post(process.env.REACT_APP_API_URL + 'ingredients', {
        nom: newIngredientName
      });

      const newIngredient = res.data; // { id_ingredient, nom }

      // 2. Ajout à la recette du produit
      onAddIngredient(newIngredient, 1);

      setNewIngredientName('');
      setSearchValue('');
      onClose();
    } catch (err) {
      console.error('Erreur lors de la création de l\'ingrédient:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-slate-900 border border-slate-700/50 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-zoom-in">

        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Ajouter un ingrédient</h3>
            <p className="text-slate-400 text-sm">Sélectionnez-en un ou créez-en un nouveau</p>
          </div>
          <button
            className="p-2 text-slate-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="px-8 mb-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type="text"
              placeholder="Rechercher par nom..."
              className="w-full bg-slate-800 border-2 border-slate-700 focus:border-cyan-500 outline-none rounded-2xl py-3 pl-12 pr-4 text-white transition-all"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="px-8">
          <div className="bg-slate-950/50 rounded-2xl border border-slate-800 max-h-[300px] overflow-y-auto">
            {filteredIngredients.length > 0 ? (
              <ul className="divide-y divide-slate-800">
                {filteredIngredients.map((ingredient, index) => (
                  <li
                    key={index}
                    className="p-4 hover:bg-slate-800 cursor-pointer flex items-center justify-between group transition-colors"
                    onClick={() => { onAddIngredient(ingredient, 1); onClose(); }}
                  >
                    <span className="text-slate-200 group-hover:text-cyan-400 font-medium transition-colors">{ingredient.nom}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-slate-500 italic">
                Aucun ingrédient trouvé pour "{searchValue}"
              </div>
            )}
          </div>
        </div>

        {/* New Ingredient Footer */}
        <div className="p-8 mt-2 bg-slate-800/50 border-t border-slate-800">
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nouvel ingrédient</h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Piment d'Espelette"
                className="flex-1 bg-slate-900 border border-slate-700 focus:border-emerald-500 outline-none rounded-xl py-3 px-4 text-white transition-all"
                value={newIngredientName}
                onChange={(e) => setNewIngredientName(e.target.value)}
              />
              <button
                onClick={handleCreateIngredient}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:grayscale text-white px-6 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                disabled={!newIngredientName.trim()}
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ingredients;
