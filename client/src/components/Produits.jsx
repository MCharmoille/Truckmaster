import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Pencil, Trash2, AlertTriangle, Plus } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, productName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative bg-slate-800 border border-slate-700/50 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 fade-in duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Archiver le produit ?</h2>
          <p className="text-slate-400 font-medium leading-relaxed mb-8">
            Attention, <span className="text-slate-100 font-bold">"{productName}"</span> sera archivé et n'apparaîtra plus. Cette action est irréversible.
          </p>
          <div className="flex gap-4 w-full">
            <button onClick={onClose} className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-black rounded-2xl transition-all uppercase tracking-widest text-xs">
              Annuler
            </button>
            <button onClick={onConfirm} className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-red-500/20 uppercase tracking-widest text-xs">
              Archiver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Produits = () => {
  const [produits, setProduits] = useState([]);
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('type'); // 'display', 'type', 'nom'
  const [productToArchive, setProductToArchive] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const getProduits = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}produits`);
        setProduits(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    getProduits();
  }, []);

  const changeDisplay = async (id_produit, currentDisplay) => {
    try {
      const newDisplay = currentDisplay === 1 ? 0 : 1;
      await axios.post(`${process.env.REACT_APP_API_URL}produits/save/` + id_produit, { display: newDisplay })
        .catch(error => {
          console.error('Erreur lors de la mise à jour:', error);
        });

      setProduits(prev => prev.map(p => p.id_produit === id_produit ? { ...p, display: newDisplay } : p));
    } catch (err) {
      console.log(err);
    }
  };

  const sortedProduits = [...produits].sort((a, b) => {
    if (sortBy === 'display') {
      // On veut les visibles (1) avant les masqués (0)
      if (a.display !== b.display) {
        return a.display === 1 ? -1 : 1;
      }
      return a.nom.localeCompare(b.nom);
    } else if (sortBy === 'type') {
      if (a.id_type !== b.id_type) {
        return a.id_type - b.id_type;
      }
      return a.nom.localeCompare(b.nom);
    } else if (sortBy === 'nom') {
      return a.nom.localeCompare(b.nom);
    }
    return 0;
  });

  const archiveProduct = (produit) => {
    setProductToArchive(produit);
    setShowConfirm(true);
  };

  const confirmArchive = async () => {
    if (!productToArchive) return;
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}produits/save/${productToArchive.id_produit}`, {
        archive: 1,
        display: 0
      });
      setProduits(prev => prev.filter(p => p.id_produit !== productToArchive.id_produit));
      setShowConfirm(false);
      setProductToArchive(null);
    } catch (err) {
      console.error("Erreur lors de l'archivage:", err);
    }
  };

  const handleCreateProduct = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}produits/create`);
      if (res.data.id_produit) {
        navigate(`/produit/${res.data.id_produit}`);
      }
    } catch (err) {
      console.error("Erreur lors de la création du produit:", err);
    }
  };

  return (
    <div className="w-full min-h-full bg-slate-900 text-white p-4 md:p-8 pb-32 max-w-5xl mx-auto space-y-8">

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmArchive}
        productName={productToArchive?.nom}
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-slate-800/50 p-6 md:p-10 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-sm gap-8 transition-all">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black tracking-tight mb-2">Produits</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Gestion du catalogue</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl transition-all font-black shadow-lg shadow-emerald-500/20 uppercase tracking-widest text-xs"
            onClick={handleCreateProduct}
          >
            <Plus className="w-5 h-5" /> Nouveau produit
          </button>
        </div>
      </div>

      {/* Sorting Controls */}
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2 bg-slate-800/40 p-1.5 rounded-2xl border border-slate-700/50">
          <button
            onClick={() => setSortBy('display')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'display' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Visibilité
          </button>
          <button
            onClick={() => setSortBy('type')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'type' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Type
          </button>
          <button
            onClick={() => setSortBy('nom')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'nom' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Nom
          </button>
        </div>
        <div className="hidden sm:block text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
          {produits.length} produits au total
        </div>
      </div>

      {/* Product List Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        {sortedProduits.map((produit) => {
          const isDisplayOn = produit.display === 1;

          return (
            <div
              key={produit.id_produit}
              className="bg-slate-800/30 rounded-[2rem] border border-slate-700/50 p-8 flex flex-col justify-between hover:bg-slate-800/60 hover:border-slate-600/50 transition-all duration-500 group shadow-xl relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${isDisplayOn ? 'bg-emerald-400' : 'bg-slate-400'}`}></div>

              <div className="flex justify-between items-start mb-6 relative">
                <div>
                  <h2 className="text-xl font-black text-slate-100 leading-tight mb-2 group-hover:text-white transition-colors">
                    {produit.nom}
                  </h2>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${isDisplayOn ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700/50 text-slate-500 border border-slate-700/50'}`}>
                    {isDisplayOn ? 'Visible' : 'Masqué'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-700/30 relative">
                <div className="flex gap-3">
                  <button
                    onClick={() => changeDisplay(produit.id_produit, produit.display)}
                    className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${isDisplayOn
                      ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white shadow-lg shadow-emerald-500/5"
                      : "bg-slate-700/50 text-slate-500 hover:bg-slate-600 hover:text-slate-100"
                      }`}
                    title={isDisplayOn ? "Masquer" : "Afficher"}
                  >
                    {isDisplayOn ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
                  </button>
                  <button
                    onClick={() => navigate(`/produit/${produit.id_produit}`)}
                    className="w-12 h-12 flex items-center justify-center bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-slate-900 rounded-2xl transition-all border border-amber-500/20 shadow-lg shadow-amber-500/5"
                    title="Détails"
                  >
                    <Pencil className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => archiveProduct(produit)}
                    className="w-12 h-12 flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all border border-red-500/20 shadow-lg shadow-red-500/5"
                    title="Archiver"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-0.5">Prix</span>
                  <span className="font-mono font-black text-slate-100 text-xl">
                    {produit.prix_produit || produit.prix}€
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Produits;