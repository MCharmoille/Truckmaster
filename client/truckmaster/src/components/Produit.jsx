import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Ingredients from "./modals/Ingredients";
import { ArrowLeft, Pencil, Trash2, Plus, Check } from 'lucide-react';

const Produit = () => {
  const { id } = useParams();
  const [produit, setProduit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [tempSelectedType, setTempSelectedType] = useState(null);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [tempQte, setTempQte] = useState("");
  const [types, setTypes] = useState([]);
  const [editFormData, setEditFormData] = useState({ nom: "", prix_produit: "", id_type: "" });

  useEffect(() => {
    const getProduit = async () => {
      try {
        const res = await axios.get(process.env.REACT_APP_API_URL + `produits/produit?id_produit=${id}&stats=true`);
        setProduit(res.data);
      } catch (err) {
        console.error('Erreur lors de la récupération du produit:', err);
      }
    };

    const getTypes = async () => {
      try {
        const res = await axios.get(process.env.REACT_APP_API_URL + 'produits/types');
        setTypes(res.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des types:', err);
      }
    };

    getProduit();
    getTypes();
  }, [id]);

  const handleAddIngredient = async (ingredient, action) => {
    var exists = produit.recette.findIndex((p) => (p.id_ingredient === ingredient.id_ingredient));

    if ((exists === -1 && action === 1) || (exists !== -1 && action === -1)) {
      try {
        let clonedProduit = { ...produit };

        if (action === 1) { // ajout d'un ingrédient
          clonedProduit.recette = [
            ...clonedProduit.recette,
            { id_produit: produit.id_produit, id_ingredient: ingredient.id_ingredient, nom: ingredient.nom, qte: null },
          ];
        } else if (action === -1 && exists !== -1) { // retrait d'un ingrédient
          clonedProduit.recette = clonedProduit.recette.filter(p => p.id_ingredient !== ingredient.id_ingredient);
        }

        axios.post(`${process.env.REACT_APP_API_URL}produits/save/` + clonedProduit.id_produit, clonedProduit)
          .catch(error => {
            console.error('Erreur lors de la mise à jour:', error);
          });

        setProduit(clonedProduit);

      } catch (err) {
        console.error('Erreur lors de la récupération du produit:', err);
      }
    }
  };

  const handleUpdateQte = async () => {
    if (!editingIngredient) return;

    try {
      let clonedProduit = { ...produit };
      const finalQte = tempQte === "" || tempQte === null ? null : tempQte;

      clonedProduit.recette = clonedProduit.recette.map(p =>
        p.id_ingredient === editingIngredient.id_ingredient ? { ...p, qte: finalQte } : p
      );

      await axios.post(`${process.env.REACT_APP_API_URL}produits/save/` + clonedProduit.id_produit, clonedProduit);
      setProduit(clonedProduit);
      setEditingIngredient(null);
      setTempQte("");
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la quantité:', err);
    }
  };

  const handleEditProduct = async () => {
    try {
      let clonedProduit = { ...produit, ...editFormData };
      await axios.post(`${process.env.REACT_APP_API_URL}produits/save/` + clonedProduit.id_produit, clonedProduit);
      setProduit(clonedProduit);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Erreur lors de la modification du produit:', err);
    }
  };

  const openEditModal = () => {
    setEditFormData({
      nom: produit.nom,
      prix_produit: produit.prix_produit,
      id_type: produit.id_type
    });
    setTempSelectedType(produit.id_type);
    setIsEditModalOpen(true);
  };

  const getTypeImage = (typeId) => {
    try {
      if (!typeId) return null;
      return require(`../img/type_produit/${typeId}_black.png`);
    } catch (err) {
      return null;
    }
  };

  const TypeImage = ({ typeId, className = "w-10 h-10 invert opacity-80" }) => {
    const src = getTypeImage(typeId);
    if (src) return <img src={src} alt="type" className={className} />;
    return (
      <div className={`${className.replace('invert', '').replace('opacity-80', '')} bg-slate-800/50 rounded-xl flex items-center justify-center border-2 border-slate-700/50 border-dashed relative overflow-hidden group-hover:border-slate-500 transition-colors`}>
        <div className="absolute inset-x-0 h-[2px] bg-slate-600/30 rotate-45 transform"></div>
        <div className="absolute inset-x-0 h-[2px] bg-slate-600/30 -rotate-45 transform"></div>
        <span className="text-[10px] text-slate-600 font-bold relative z-10">?</span>
      </div>
    );
  };

  if (!produit) {
    return <p className="text-center text-slate-500 mt-20 animate-pulse">Chargement...</p>;
  }

  return (
    <div className="w-full min-h-full bg-slate-900 text-white p-4 md:p-8 pb-32 max-w-5xl mx-auto space-y-8">

      {/* Header Section */}
      <div className="relative bg-slate-800/50 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-sm overflow-hidden min-h-[140px] flex items-center p-6 md:p-10">
        <div className="flex flex-col md:flex-row items-center gap-8 w-full z-10">
          {/* Back Button */}
          <button
            className="flex items-center justify-center w-12 h-12 bg-slate-900/80 hover:bg-slate-700 text-slate-300 rounded-2xl transition-all border border-slate-700/50 shadow-xl shrink-0"
            onClick={() => window.history.back()}
            title="Retour"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-black leading-tight tracking-tight mb-1">{produit.nom}</h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Fiche produit</p>
          </div>

          <div className="flex items-center gap-10">
            <div className="text-right">
              <span className="text-slate-500 text-[10px] block uppercase tracking-[0.2em] font-black mb-1">Prix de vente</span>
              <span className="text-4xl font-black text-emerald-400 font-mono drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                {produit.prix_produit} €
              </span>
            </div>

            <div className="h-16 w-[1px] bg-slate-700/50 hidden md:block"></div>

            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-2 bg-cyan-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <TypeImage typeId={produit.id_type} className="w-14 h-14 invert opacity-90 relative" />
              </div>

              <button
                className="w-12 h-12 flex items-center justify-center bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-slate-900 rounded-2xl transition-all border border-amber-500/50 shadow-xl shadow-amber-500/5"
                onClick={openEditModal}
              >
                <Pencil className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recipe Section */}
        <section className="bg-slate-800/30 rounded-[2.5rem] border border-slate-700/50 overflow-hidden shadow-xl flex flex-col">
          <div className="p-8 border-b border-slate-700/50 bg-slate-800/50">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-100">
              <span className="w-2.5 h-8 bg-emerald-500 rounded-full"></span>
              Ingrédients & Recette
            </h2>
          </div>

          <div className="p-8 space-y-4">
            <ul className="space-y-3">
              {produit.recette && produit.recette.map((ingredient, index) => (
                <li
                  key={index}
                  className="flex items-center gap-4 bg-slate-900/50 p-5 rounded-3xl border border-slate-700/30 hover:border-emerald-500/50 transition-all group cursor-pointer"
                  onClick={() => {
                    setEditingIngredient(ingredient);
                    setTempQte(ingredient.qte || "");
                  }}
                >
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <span className="text-slate-100 font-bold block text-lg">{ingredient.nom}</span>
                      {ingredient.qte > 0 && (
                        <span className="text-xs text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full font-black uppercase tracking-widest mt-1 inline-block">
                          Qté: {ingredient.qte}
                        </span>
                      )}
                    </div>
                    <button
                      className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddIngredient({ id_ingredient: ingredient.id_ingredient }, -1);
                      }}
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-6 mt-4 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-black rounded-3xl transition-all border-2 border-slate-700 border-dashed flex items-center justify-center gap-3 group uppercase tracking-widest text-sm"
            >
              <Plus className="w-6 h-6 group-hover:scale-125 transition-transform" />
              Ajouter un ingrédient
            </button>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="bg-slate-800/30 rounded-[2.5rem] border border-slate-700/50 overflow-hidden shadow-xl flex flex-col">
          <div className="p-8 border-b border-slate-700/50 bg-slate-800/50">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-100">
              <span className="w-2.5 h-8 bg-cyan-500 rounded-full"></span>
              Statistiques de vente
            </h2>
          </div>

          <div className="p-8 flex flex-col h-full justify-between gap-8">
            <div className="flex items-end justify-between gap-4 h-64 px-4 bg-slate-900/30 rounded-3xl border border-slate-800/50 pb-8 pt-12 relative">
              {produit.stats && produit.stats.length > 0 ? (
                produit.stats.slice(-6).map((stat, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-4 group h-full justify-end">
                    <div className="w-full flex justify-center items-end relative" style={{ height: `${Math.min(100, (stat.total_ventes / 100) * 100)}%` }}>
                      <div
                        className="w-full max-w-[32px] bg-cyan-500/20 group-hover:bg-cyan-500/50 border-t-4 border-cyan-400 rounded-t-xl transition-all duration-700 h-full relative"
                      >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 text-cyan-400 text-xs font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-20 shadow-2xl scale-75 group-hover:scale-100">
                          {stat.total_ventes} vds.
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                      {stat.mois.split('-')[1] === '01' ? 'Jan' :
                        stat.mois.split('-')[1] === '02' ? 'Fév' :
                          stat.mois.split('-')[1] === '03' ? 'Mar' :
                            stat.mois.split('-')[1] === '04' ? 'Avr' :
                              stat.mois.split('-')[1] === '05' ? 'Mai' :
                                stat.mois.split('-')[1] === '06' ? 'Juin' :
                                  stat.mois.split('-')[1] === '07' ? 'Juil' :
                                    stat.mois.split('-')[1] === '08' ? 'Août' :
                                      stat.mois.split('-')[1] === '09' ? 'Sept' :
                                        stat.mois.split('-')[1] === '10' ? 'Oct' :
                                          stat.mois.split('-')[1] === '11' ? 'Nov' : 'Déc'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-600 font-bold italic">
                  Aucune donnée de vente
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/50 flex flex-col items-center justify-center">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total 30j</span>
                <span className="text-3xl font-black text-slate-100">
                  {produit.stats && produit.stats.length > 0 ? produit.stats[produit.stats.length - 1].total_ventes : 0}
                </span>
              </div>
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/50 flex flex-col items-center justify-center">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Moyenne</span>
                <span className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.2)]">
                  {produit.stats && produit.stats.length > 0
                    ? Math.round(produit.stats.reduce((acc, curr) => acc + Number(curr.total_ventes), 0) / produit.stats.length)
                    : 0}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Ingredients isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddIngredient={handleAddIngredient} />

      {/* Quantity Edit Modal */}
      {editingIngredient && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setEditingIngredient(null)} />
          <div className="relative bg-slate-900 border border-slate-700 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-zoom-in">
            <h3 className="text-xl font-bold mb-2 text-white">Modifier la quantité</h3>
            <p className="text-slate-400 text-sm mb-6">{editingIngredient.nom}</p>
            <input
              type="number"
              className="w-full bg-slate-800 border-2 border-slate-700 focus:border-emerald-500 outline-none rounded-xl py-3 px-4 text-white text-xl mb-6"
              value={tempQte || ""}
              onChange={(e) => setTempQte(e.target.value)}
              autoFocus
            />
            <div className="flex gap-4">
              <button
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all"
                onClick={() => setEditingIngredient(null)}
              >
                Annuler
              </button>
              <button
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                onClick={handleUpdateQte}
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative bg-slate-900 border border-slate-700 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-zoom-in overflow-hidden">
            <div className="mb-8">
              <h3 className="text-2xl font-black text-white mb-2">Modifier le produit</h3>
              <p className="text-slate-500 font-medium">Mise à jour des informations générales</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 mb-2 block">Nom du produit</label>
                <input
                  type="text"
                  className="w-full bg-slate-800/50 border-2 border-slate-700 focus:border-emerald-500 outline-none rounded-2xl py-4 px-5 text-white transition-all"
                  value={editFormData.nom}
                  onChange={(e) => setEditFormData({ ...editFormData, nom: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 mb-2 block">Prix (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full bg-slate-800/50 border-2 border-slate-700 focus:border-emerald-500 outline-none rounded-2xl py-4 px-5 text-white transition-all font-mono"
                    value={editFormData.prix_produit}
                    onChange={(e) => setEditFormData({ ...editFormData, prix_produit: e.target.value })}
                  />
                </div>

                <div className="flex flex-col items-center">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 block w-full text-center">Type</label>
                  <button
                    className="relative p-1 rounded-2xl transition-all group"
                    onClick={() => setIsTypeModalOpen(true)}
                  >
                    <div className="absolute -inset-1 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-2xl opacity-20 group-hover:opacity-100 blur transition-all duration-500"></div>
                    <div className="relative bg-slate-900 border-2 border-slate-700 group-hover:border-amber-400 p-4 rounded-2xl flex items-center justify-center min-w-[80px] min-h-[80px] shadow-2xl">
                      <TypeImage typeId={editFormData.id_type} className="w-12 h-12 invert opacity-90 transition-transform group-hover:scale-110 duration-300" />
                      <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-900 w-7 h-7 rounded-lg flex items-center justify-center shadow-lg border-2 border-slate-900 transform group-hover:scale-110 transition-all duration-300">
                        <Pencil className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-xs"
                onClick={() => setIsEditModalOpen(false)}
              >
                Annuler
              </button>
              <button
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-widest text-xs"
                onClick={handleEditProduct}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Type Selector Modal */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setIsTypeModalOpen(false)} />
          <div className="relative bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl animate-zoom-in flex flex-col max-h-[90vh]">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-white mb-2">Choisir un type</h3>
                <p className="text-slate-500 font-medium tracking-tight">Sélectionnez la catégorie visuelle</p>
              </div>
            </div>

            <div className="overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {types.map(t => (
                  <button
                    key={t.id_type}
                    className={`relative p-6 rounded-3xl transition-all border-4 flex flex-col items-center gap-4 group ${tempSelectedType === t.id_type
                      ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                      : 'bg-slate-800/50 border-transparent hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    onClick={() => setTempSelectedType(t.id_type)}
                  >
                    <TypeImage typeId={t.id_type} className={`w-20 h-20 invert transition-transform group-hover:scale-110 duration-500 ${tempSelectedType === t.id_type ? 'opacity-100' : 'opacity-40'}`} />
                    <span className={`text-xs font-black uppercase tracking-widest text-center ${tempSelectedType === t.id_type ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {t.nom}
                    </span>

                    {tempSelectedType === t.id_type && (
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-bounce-subtle">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-xs"
                onClick={() => setIsTypeModalOpen(false)}
              >
                Annuler
              </button>
              <button
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-widest text-xs"
                onClick={() => {
                  setEditFormData({ ...editFormData, id_type: tempSelectedType });
                  setIsTypeModalOpen(false);
                }}
              >
                Valider la sélection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Produit;
