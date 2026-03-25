import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { ShoppingBag, Plus, Edit2, Trash2, X, Check, Euro, Calendar, Package, Camera, Loader2, ListPlus, ChevronDown, ChevronUp, FileText } from 'lucide-react';

const Achats = () => {
    const [achats, setAchats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isScanning, setIsScanning] = useState(false);
    const [scannedItems, setScannedItems] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingAchat, setEditingAchat] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        quantite: '',
        prix: '',
        date_achat: moment().format('YYYY-MM-DD')
    });
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        limit: 20
    });
    const [hasMore, setHasMore] = useState(true);
    const [expandedFactures, setExpandedFactures] = useState({});

    const toggleFacture = (id) => {
        setExpandedFactures(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const fetchAchats = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}achats`, {
                params: filters
            });
            setAchats(res.data);
            setHasMore(res.data.length === filters.limit);
            setIsLoading(false);
        } catch (error) {
            console.error("Erreur lors de la récupération des achats:", error);
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchAchats();
    }, [fetchAchats]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAchat) {
                await axios.put(`${process.env.REACT_APP_API_URL}achats/${editingAchat.id_achat}`, formData);
            } else {
                await axios.post(`${process.env.REACT_APP_API_URL}achats`, formData);
            }
            setShowForm(false);
            setEditingAchat(null);
            setFormData({
                nom: '',
                quantite: '',
                prix: '',
                date_achat: moment().format('YYYY-MM-DD')
            });
            fetchAchats();
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de l'achat:", error);
        }
    };

    const handleScan = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsScanning(true);
        const scanFormData = new FormData();
        scanFormData.append('image', file);

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}achats/scan`, scanFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setScannedItems(res.data);
            setShowForm(false); // On ferme le formulaire simple pour montrer le résultat du scan
        } catch (error) {
            console.error("Erreur lors du scan:", error);
            const msg = error.response?.data?.message || "Erreur lors de l'analyse du ticket.";
            alert(msg);
        } finally {
            setIsScanning(false);
        }
    };

    const handleConfirmScan = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}achats/factures`, {
                date: moment().format('YYYY-MM-DD'),
                items: scannedItems
            });
            setScannedItems([]);
            fetchAchats();
        } catch (error) {
            console.error("Erreur lors de la confirmation du scan:", error);
        }
    };

    const updateScannedItem = (index, field, value) => {
        const newItems = [...scannedItems];
        newItems[index][field] = value;
        setScannedItems(newItems);
    };

    const removeScannedItem = (index) => {
        setScannedItems(scannedItems.filter((_, i) => i !== index));
    };

    const handleEdit = (achat) => {
        setEditingAchat(achat);
        setFormData({
            nom: achat.nom,
            quantite: achat.quantite,
            prix: achat.prix,
            date_achat: moment(achat.date_achat).format('YYYY-MM-DD')
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet achat ?")) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}achats/${id}`);
                fetchAchats();
            } catch (error) {
                console.error("Erreur lors de la suppression de l'achat:", error);
            }
        }
    };

    const processedAchats = React.useMemo(() => {
        const grouped = [];
        const facturesSeen = new Set();

        achats.forEach(achat => {
            if (achat.id_facture) {
                if (!facturesSeen.has(achat.id_facture)) {
                    const factureItems = achats.filter(a => a.id_facture === achat.id_facture);
                    const total = factureItems.reduce((sum, item) => sum + Number(item.prix), 0);
                    
                    grouped.push({
                        type: 'facture',
                        id: achat.id_facture,
                        numero: achat.facture_numero,
                        date: achat.facture_date,
                        items: factureItems,
                        total: total
                    });
                    facturesSeen.add(achat.id_facture);
                }
            } else {
                grouped.push({ type: 'solo', ...achat });
            }
        });
        return grouped;
    }, [achats]);

    return (
        <div className="w-full min-h-screen bg-slate-900 p-4 md:p-8 animate-fade-in text-white">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Achats</h1>
                            <p className="text-slate-400">Gérez vos dépenses et fournitures</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                         <button
                            onClick={() => {
                                setShowForm(!showForm);
                                if (showForm) setEditingAchat(null);
                            }}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${showForm
                                ? 'bg-slate-700 text-white hover:bg-slate-600'
                                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20'
                                }`}
                        >
                            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {showForm ? 'Annuler' : 'Nouvel Achat'}
                        </button>

                        <label className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all cursor-pointer shadow-lg shadow-indigo-500/20">
                            {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                            {isScanning ? 'Analyse...' : 'Scanner Ticket'}
                            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleScan} disabled={isScanning} />
                        </label>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-4 mb-8 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-400 font-medium">Filtrer par date :</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5">
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="bg-transparent text-sm text-white outline-none"
                        />
                        <span className="text-slate-600">à</span>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            className="bg-transparent text-sm text-white outline-none"
                        />
                    </div>
                    {(filters.startDate || filters.endDate) && (
                        <button
                            onClick={() => setFilters({ ...filters, startDate: '', endDate: '' })}
                            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                        >
                            <X className="w-3 h-3" />
                            Réinitialiser
                        </button>
                    )}
                </div>

                {/* Scanned Items Review Section */}
                {scannedItems.length > 0 && (
                    <div className="bg-slate-800 rounded-2xl border-2 border-indigo-500/50 p-6 mb-8 shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <ListPlus className="w-6 h-6 text-indigo-400" />
                                Articles détectés par l'IA
                            </h2>
                            <button onClick={() => setScannedItems([])} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-8">
                            {scannedItems.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-900 rounded-xl border border-slate-700 relative group">
                                    <div className="md:col-span-2">
                                        <label className="text-xs text-slate-500 mb-1 block">Nom</label>
                                        <input
                                            value={item.nom}
                                            onChange={(e) => updateScannedItem(index, 'nom', e.target.value)}
                                            className="bg-transparent text-white font-bold w-full outline-none focus:text-indigo-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Qté</label>
                                        <input
                                            type="number"
                                            value={item.quantite}
                                            onChange={(e) => updateScannedItem(index, 'quantite', e.target.value)}
                                            className="bg-transparent text-white font-mono w-full outline-none focus:text-indigo-400"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <label className="text-xs text-slate-500 mb-1 block">Prix Total</label>
                                            <input
                                                type="number"
                                                value={item.prix}
                                                onChange={(e) => updateScannedItem(index, 'prix', e.target.value)}
                                                className="bg-transparent text-emerald-400 font-mono font-bold w-full outline-none focus:text-indigo-400"
                                            />
                                        </div>
                                        <button onClick={() => removeScannedItem(index)} className="mt-4 p-2 text-slate-600 hover:text-red-400 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-700 pt-6">
                            <button
                                onClick={() => setScannedItems([])}
                                className="px-6 py-2 rounded-xl font-bold text-slate-400 hover:text-white transition-all"
                            >
                                Tout annuler
                            </button>
                            <button
                                onClick={handleConfirmScan}
                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/30"
                            >
                                <Check className="w-5 h-5" />
                                Enregistrer la facture
                            </button>
                        </div>
                    </div>
                )}

                {/* Form Section */}
                {showForm && (
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 mb-8 shadow-xl animate-scale-in">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            {editingAchat ? <Edit2 className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5 text-emerald-400" />}
                            {editingAchat ? 'Modifier l\'achat' : 'Ajouter une dépense'}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-slate-400 text-sm font-medium">Nom de l'achat</label>
                                <div className="relative">
                                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="text"
                                        name="nom"
                                        value={formData.nom}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Pain burger, Salade..."
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-600 outline-none focus:border-emerald-500 transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-slate-400 text-sm font-medium">Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="date"
                                        name="date_achat"
                                        value={formData.date_achat}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white outline-none focus:border-emerald-500 transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-slate-400 text-sm font-medium">Quantité</label>
                                <input
                                    type="number"
                                    name="quantite"
                                    step="0.01"
                                    value={formData.quantite}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-600 outline-none focus:border-emerald-500 transition-colors"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-slate-400 text-sm font-medium">Prix Total (€)</label>
                                <div className="relative">
                                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="number"
                                        name="prix"
                                        step="0.01"
                                        value={formData.prix}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-600 outline-none focus:border-emerald-500 transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingAchat(null);
                                    }}
                                    className="px-6 py-2 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                                >
                                    <Check className="w-5 h-5" />
                                    {editingAchat ? 'Actualiser' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* List Section */}
                <div className="space-y-4 pb-20">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Historique des achats</h2>
                        <span className="text-sm bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700">
                            {achats.length} article{achats.length > 1 ? 's' : ''}
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="p-12 flex justify-center items-center">
                            <Loader2 className="w-10 h-10 border-emerald-500 animate-spin" />
                        </div>
                    ) : processedAchats.length > 0 ? (
                        processedAchats.map((entry, index) => (
                            <div key={entry.type === 'facture' ? `f-${entry.id}` : `s-${entry.id_achat}`} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                                {entry.type === 'facture' ? (
                                    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg transition-all">
                                        <div 
                                            onClick={() => toggleFacture(entry.id)}
                                            className="p-4 md:p-6 flex items-center justify-between cursor-pointer hover:bg-slate-700/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                                    <FileText className="w-6 h-6 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold">FACTURE N° {entry.numero.toString().padStart(4, '0')}</h3>
                                                    <p className="text-slate-400 text-sm">{moment(entry.date).format('DD MMMM YYYY')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right hidden sm:block">
                                                    <span className="text-2xl font-black text-emerald-400">{entry.total.toFixed(2)} €</span>
                                                    <p className="text-xs text-slate-500">{entry.items.length} articles</p>
                                                </div>
                                                {expandedFactures[entry.id] ? <ChevronUp className="w-6 h-6 text-slate-500" /> : <ChevronDown className="w-6 h-6 text-slate-500" />}
                                            </div>
                                        </div>

                                        {expandedFactures[entry.id] && (
                                            <div className="border-t border-slate-700 bg-slate-900/50 p-4">
                                                <div className="space-y-2">
                                                    {entry.items.map((item) => (
                                                        <div key={item.id_achat} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-colors group">
                                                            <div className="flex gap-4 items-center">
                                                                <span className="text-slate-500 font-mono text-sm">{item.quantite}x</span>
                                                                <span className="font-medium">{item.nom}</span>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-emerald-400 font-bold">{Number(item.prix).toFixed(2)} €</span>
                                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-500 hover:text-white bg-slate-700 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                                                                    <button onClick={() => handleDelete(item.id_achat)} className="p-1.5 text-slate-500 hover:text-red-400 bg-slate-700 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-slate-800/40 hover:bg-slate-800 rounded-2xl border border-slate-700 p-4 md:p-6 flex items-center justify-between transition-all group shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                                <Package className="w-6 h-6 text-emerald-500/60" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold group-hover:text-emerald-400 transition-colors">{entry.nom}</h3>
                                                <p className="text-slate-400 text-sm">{moment(entry.date_achat).format('DD MMMM YYYY')} • {entry.quantite} unité(s)</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xl font-bold text-emerald-400">{Number(entry.prix).toFixed(2)} €</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit(entry)} className="p-2 text-slate-500 hover:text-white hover:bg-slate-700 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(entry.id_achat)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-20 text-center bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-700">
                            <ShoppingBag className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-500 text-lg">Aucun achat enregistré pour le moment.</p>
                        </div>
                    )}

                    {hasMore && (
                        <div className="pt-8 flex justify-center">
                            <button
                                onClick={() => setFilters({ ...filters, limit: filters.limit + 20 })}
                                className="text-emerald-400 hover:text-emerald-300 font-bold py-3 px-8 rounded-2xl border-2 border-emerald-500/20 hover:border-emerald-500/40 flex items-center gap-2 transition-all bg-emerald-500/5"
                            >
                                <Plus className="w-5 h-5" />
                                Charger plus d'achats
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Achats;
