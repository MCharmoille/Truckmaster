import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Loader2, Search } from 'lucide-react';
import axios from 'axios';
import moment from 'moment';

const DevisModal = ({ isOpen, onClose, devis, onSave }) => {
    const [formData, setFormData] = useState({
        nom: '',
        adresse: '',
        adresse_suite: '',
        date_commande: moment().format('YYYY-MM-DD'),
        produits: []
    });
    const [availableProduits, setAvailableProduits] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (devis) {
            setFormData({
                nom: devis.nom || '',
                adresse: devis.adresse || '',
                adresse_suite: devis.adresse_suite || '',
                date_commande: devis.date_commande ? moment(devis.date_commande).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
                produits: devis.devis_produits.map(p => ({
                    id_produit: p.id_produit,
                    nom: p.nom_produit,
                    quantite: p.quantite,
                    prix: p.prix
                }))
            });
        } else {
            setFormData({
                nom: '',
                adresse: '',
                adresse_suite: '',
                date_commande: moment().format('YYYY-MM-DD'),
                produits: []
            });
        }
    }, [devis, isOpen]);

    useEffect(() => {
        const fetchProduits = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}produits`);
                setAvailableProduits(res.data);
            } catch (err) {
                console.error("Error fetching produits:", err);
            }
        };
        if (isOpen) fetchProduits();
    }, [isOpen]);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (devis) {
                await axios.put(`${process.env.REACT_APP_API_URL}devis/${devis.id}`, formData);
            } else {
                await axios.post(`${process.env.REACT_APP_API_URL}devis`, formData);
            }
            onSave();
            onClose();
        } catch (err) {
            console.error("Error saving devis:", err);
            alert("Erreur lors de l'enregistrement du devis.");
        } finally {
            setLoading(false);
        }
    };

    const addProduit = (produit) => {
        setFormData(prev => ({
            ...prev,
            produits: [...prev.produits, {
                id_produit: produit.id_produit,
                nom: produit.nom,
                quantite: 1,
                prix: produit.prix_produit
            }]
        }));
        setSearchQuery('');
    };

    const removeProduit = (index) => {
        setFormData(prev => ({
            ...prev,
            produits: prev.produits.filter((_, i) => i !== index)
        }));
    };

    const updateProduit = (index, field, value) => {
        const newProduits = [...formData.produits];
        newProduits[index][field] = field === 'quantite' ? parseInt(value) || 0 : parseFloat(value) || 0;
        setFormData(prev => ({ ...prev, produits: newProduits }));
    };

    if (!isOpen) return null;

    const filteredProduits = availableProduits.filter(p =>
        p.nom.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-800 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800">
                    <h2 className="text-2xl font-black text-white">
                        {devis ? `Modifier Devis N° ${devis.id}` : 'Nouveau Devis'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-xl transition-colors text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Informations Client</h3>
                            <div className="space-y-4">
                                <input
                                    placeholder="Nom du client"
                                    className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl px-6 py-3 text-white focus:border-purple-500 outline-none transition-all font-bold"
                                    value={formData.nom}
                                    onChange={e => setFormData({ ...formData, nom: e.target.value })}
                                    required
                                />
                                <input
                                    placeholder="Adresse"
                                    className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl px-6 py-3 text-white focus:border-purple-500 outline-none transition-all font-bold"
                                    value={formData.adresse}
                                    onChange={e => setFormData({ ...formData, adresse: e.target.value })}
                                />
                                <input
                                    placeholder="Complément d'adresse"
                                    className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl px-6 py-3 text-white focus:border-purple-500 outline-none transition-all font-bold"
                                    value={formData.adresse_suite}
                                    onChange={e => setFormData({ ...formData, adresse_suite: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Détails Devis</h3>
                            <input
                                type="date"
                                className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl px-6 py-3 text-white focus:border-purple-500 outline-none transition-all font-bold"
                                value={formData.date_commande}
                                onChange={e => setFormData({ ...formData, date_commande: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Produits</h3>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                <input
                                    placeholder="Ajouter un produit..."
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-purple-500 outline-none transition-all"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden animate-slide-up">
                                        {filteredProduits.length > 0 ? filteredProduits.map(p => (
                                            <button
                                                key={p.id_produit}
                                                type="button"
                                                onClick={() => addProduit(p)}
                                                className="w-full px-4 py-3 text-left hover:bg-slate-800 text-white text-sm font-bold border-b border-slate-800 last:border-0"
                                            >
                                                {p.nom} — <span className="text-purple-400">{p.prix_produit}€</span>
                                            </button>
                                        )) : (
                                            <div className="px-4 py-3 text-slate-500 text-sm italic">Aucun produit trouvé</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {formData.produits.map((item, index) => (
                                <div key={index} className="flex gap-4 p-4 bg-slate-900/50 rounded-[1.5rem] border border-slate-700/50 items-center animate-slide-up">
                                    <div className="flex-1">
                                        <p className="text-white font-black">{item.nom}</p>
                                    </div>
                                    <div className="w-24">
                                        <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Qté</p>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-3 py-1 text-white focus:border-purple-500 outline-none text-center font-bold"
                                            value={item.quantite}
                                            onChange={e => updateProduit(index, 'quantite', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-32">
                                        <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Prix Unit.</p>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-3 py-1 text-white focus:border-purple-500 outline-none text-right font-bold pr-7"
                                                value={item.prix}
                                                onChange={e => updateProduit(index, 'prix', e.target.value)}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">€</span>
                                        </div>
                                    </div>
                                    <div className="w-32 text-right">
                                        <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Total</p>
                                        <p className="text-white font-black">
                                            {(item.quantite * item.prix).toFixed(2)}€
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeProduit(index)}
                                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all ml-2"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                            {formData.produits.length === 0 && (
                                <div className="text-center py-10 bg-slate-900/30 rounded-[1.5rem] border border-dashed border-slate-700">
                                    <p className="text-slate-500 font-bold">Aucun produit ajouté au devis</p>
                                </div>
                            )}
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-slate-700 bg-slate-800/80 backdrop-blur-md flex justify-between items-center">
                    <div className="text-left">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Total Devis (TTC)</p>
                        <p className="text-3xl font-black text-white">
                            {formData.produits.reduce((acc, p) => acc + (p.quantite * p.prix), 0).toFixed(2)}€
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-2xl font-black transition-all"
                        >
                            ANNULER
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading || !formData.nom || formData.produits.length === 0}
                            className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black transition-all shadow-xl shadow-purple-500/20 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                            {devis ? 'METTRE À JOUR' : 'ENREGISTRER LE DEVIS'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DevisModal;
