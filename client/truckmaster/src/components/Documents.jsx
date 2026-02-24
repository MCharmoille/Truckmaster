import React, { useState, useEffect } from 'react';
import moment from 'moment';
import 'moment/locale/fr';
import { FileText, ShoppingBag, TrendingUp, FileSpreadsheet, FileCheck, ChevronLeft, Loader2, Search, Pencil, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PDFDownloadLink } from '@react-pdf/renderer';
import RecettePDF from './documents/RecettePDF';
import AchatPDF from './documents/AchatPDF';
import DevisPDF from './documents/DevisPDF';
import DevisModal from './modals/DevisModal';

const Documents = () => {
    const [selectedType, setSelectedType] = useState(null);
    const [month, setMonth] = useState(moment().format('MM'));
    const [year, setYear] = useState(moment().format('YYYY'));
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDevis, setSelectedDevis] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [devisToEdit, setDevisToEdit] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const documentTypes = [
        { id: 'achats', name: 'Achats', icon: ShoppingBag, color: 'emerald', enabled: true },
        { id: 'ventes', name: 'Ventes', icon: TrendingUp, color: 'cyan', enabled: true },
        { id: 'devis', name: 'Devis', icon: FileSpreadsheet, color: 'purple', enabled: true },
        { id: 'factures', name: 'Factures', icon: FileCheck, color: 'amber', enabled: false },
    ];

    const months = moment.months();
    const years = [];
    for (let i = 2024; i <= parseInt(moment().format('YYYY')) + 1; i++) {
        years.push(i.toString());
    }

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}utilisateurs/1`);
                setCurrentUser(res.data);
            } catch (err) {
                console.error("Error fetching user data:", err);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (selectedType) {
            fetchData();
        }
    }, [selectedType, month, year]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (selectedType === 'ventes') {
                const dateStr = `${year}-${month}`;
                const res = await axios.get(`${process.env.REACT_APP_API_URL}commandes/date/${dateStr}`);
                setData(res.data);
            } else if (selectedType === 'achats') {
                const startDate = moment(`${year}-${month}-01`).startOf('month').format('YYYY-MM-DD');
                const endDate = moment(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD');
                const res = await axios.get(`${process.env.REACT_APP_API_URL}achats`, {
                    params: { startDate, endDate }
                });
                setData(res.data);
            } else if (selectedType === 'devis') {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}devis`);
                setData(res.data);
            }
        } catch (err) {
            console.error("Error fetching data for PDF:", err);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Voulez-vous vraiment supprimer ce devis ?")) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}devis/${id}`);
                fetchData();
            } catch (err) {
                console.error("Error deleting devis:", err);
            }
        }
    };

    const filteredDevis = selectedType === 'devis' ? data.filter(d =>
        d.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.id.toString().includes(searchQuery)
    ) : [];

    if (!selectedType) {
        return (
            <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
                <div className="flex items-center gap-4 mb-10">
                    <Link to="/" className="p-3 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-colors text-slate-400 hover:text-white">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-4xl font-bold text-white">Documents</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                    {documentTypes.map((type) => (
                        <div
                            key={type.id}
                            onClick={() => type.enabled && setSelectedType(type.id)}
                            className={`group relative p-8 rounded-3xl border transition-all duration-300 
                                ${type.enabled
                                    ? `bg-slate-800 border-slate-700 hover:border-${type.color}-500/50 hover:bg-slate-800/80 hover:-translate-y-2 cursor-pointer shadow-lg hover:shadow-${type.color}-500/10`
                                    : 'bg-slate-900 border-slate-800 opacity-50 grayscale cursor-not-allowed'
                                }`}
                        >
                            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform
                                ${type.id === 'achats' ? 'bg-emerald-500/20' :
                                    type.id === 'ventes' ? 'bg-cyan-500/20' :
                                        type.id === 'devis' ? 'bg-purple-500/20' :
                                            'bg-amber-500/20'}`}>
                                <type.icon className={`w-10 h-10 
                                    ${type.id === 'achats' ? 'text-emerald-400' :
                                        type.id === 'ventes' ? 'text-cyan-400' :
                                            type.id === 'devis' ? 'text-purple-400' :
                                                type.id === 'factures' ? 'text-amber-400' : 'text-slate-500'}`} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{type.name}</h3>
                            <p className="text-slate-400 text-lg">
                                {type.enabled ? `Générer les documents de ${type.name.toLowerCase()}.` : 'Bientôt disponible.'}
                            </p>

                            {!type.enabled && (
                                <span className="absolute top-6 right-6 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    Désactivé
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-10">
                <button
                    onClick={() => { setSelectedType(null); setData([]); setSelectedDevis(null); setSearchQuery(''); }}
                    className="p-3 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-white capitalize">{selectedType}</h1>
                    <p className="text-slate-400">
                        {selectedType === 'devis' ? 'Recherchez et sélectionnez un devis' : 'Sélectionnez la période pour générer le PDF'}
                    </p>
                </div>
            </div>

            <div className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700/50 shadow-2xl">
                {selectedType === 'devis' ? (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Rechercher par nom ou numéro..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl pl-12 pr-6 py-4 text-white outline-none focus:border-purple-500 transition-all font-bold"
                                />
                            </div>
                            <button
                                onClick={() => { setDevisToEdit(null); setIsModalOpen(true); }}
                                className="bg-purple-600 hover:bg-purple-500 text-white font-black px-6 py-4 rounded-2xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                <Plus className="w-6 h-6" />
                                NOUVEAU DEVIS
                            </button>
                        </div>

                        {loading ? (
                            <div className="py-10 flex items-center justify-center gap-3 text-slate-400 font-bold">
                                <Loader2 className="w-6 h-6 animate-spin" />
                                Chargement des devis...
                            </div>
                        ) : (
                            <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                                {filteredDevis.map((devis) => (
                                    <div
                                        key={devis.id}
                                        onClick={() => setSelectedDevis(devis)}
                                        className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center group
                                            ${selectedDevis?.id === devis.id
                                                ? 'bg-purple-500/20 border-purple-500'
                                                : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}
                                    >
                                        <div>
                                            <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">
                                                N° {devis.id.toString().padStart(4, '0')} — {moment(devis.date_commande).format('DD/MM/YYYY')}
                                            </p>
                                            <h4 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                                                {devis.nom}
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setDevisToEdit(devis); setIsModalOpen(true); }}
                                                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
                                                title="Modifier"
                                            >
                                                <Pencil className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(devis.id); }}
                                                className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            {selectedDevis?.id === devis.id && (
                                                <div className="bg-purple-500 text-white p-2 rounded-full ml-2">
                                                    <FileCheck className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {filteredDevis.length === 0 && (
                                    <p className="text-center text-slate-500 py-10 font-bold">Aucun devis trouvé.</p>
                                )}
                            </div>
                        )}

                        {selectedDevis && (
                            <PDFDownloadLink
                                document={<DevisPDF devis={selectedDevis} user={currentUser} />}
                                fileName={`DEVIS_${selectedDevis.id.toString().padStart(4, '0')}_${selectedDevis.nom.replace(/\s+/g, '_')}.pdf`}
                            >
                                {({ loading: pdfLoading }) => (
                                    <button
                                        className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-xl transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-4 mt-6 animate-slide-up"
                                        disabled={pdfLoading}
                                    >
                                        <FileText className="w-6 h-6" />
                                        {pdfLoading ? 'PRÉPARATION...' : 'GÉNÉRER LE PDF DU DEVIS'}
                                    </button>
                                )}
                            </PDFDownloadLink>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="space-y-3">
                                <label className="text-slate-400 font-bold ml-1 uppercase text-xs tracking-widest">Mois</label>
                                <select
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl px-6 py-4 text-white outline-none focus:border-cyan-500 transition-all font-bold appearance-none cursor-pointer"
                                >
                                    {months.map((m, i) => (
                                        <option key={i} value={(i + 1).toString().padStart(2, '0')}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-slate-400 font-bold ml-1 uppercase text-xs tracking-widest">Année</label>
                                <select
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl px-6 py-4 text-white outline-none focus:border-cyan-500 transition-all font-bold appearance-none cursor-pointer"
                                >
                                    {years.map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="w-full py-5 flex items-center justify-center gap-3 text-slate-400 font-bold">
                                <Loader2 className="w-6 h-6 animate-spin" />
                                Chargement des données...
                            </div>
                        ) : (
                            <PDFDownloadLink
                                document={selectedType === 'ventes'
                                    ? <RecettePDF data={data} month={month} year={year} />
                                    : <AchatPDF data={data} month={month} year={year} />}
                                fileName={`${selectedType.toUpperCase()}_${month}_${year}.pdf`}
                            >
                                {({ loading: pdfLoading }) => (
                                    <button
                                        className={`w-full py-5 rounded-2xl font-black text-xl transition-all shadow-xl
                                            ${selectedType === 'achats'
                                                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                                                : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/20'} 
                                            text-white flex items-center justify-center gap-4`}
                                        disabled={pdfLoading || data.length === 0}
                                    >
                                        <FileText className="w-6 h-6" />
                                        {pdfLoading ? 'PRÉPARATION...' : 'TÉLÉCHARGER LE PDF'}
                                    </button>
                                )}
                            </PDFDownloadLink>
                        )}

                        {!loading && data.length === 0 && (
                            <p className="mt-6 text-center text-amber-400 font-bold bg-amber-900/20 p-4 rounded-2xl border border-amber-900/50">
                                Aucune donnée trouvée pour cette période.
                            </p>
                        )}
                    </>
                )}
            </div>

            <DevisModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                devis={devisToEdit}
                onSave={fetchData}
            />
        </div>
    );
};

export default Documents;
