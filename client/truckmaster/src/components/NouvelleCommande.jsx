import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ModalCustomProduit from "./modals/CustomProduit";
import ModalBoissons from "./modals/Boissons";
import Confirm from "./modals/Confirm";
import moment from 'moment';
import 'moment/locale/fr';
import {
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    Calendar as CalendarIcon,
    Clock,
    User,
    CheckCircle2,
    ChevronRight,
    Beer,
} from 'lucide-react';

const NouvelleCommande = () => {
    const { commandeId } = useParams();
    const [commande, setCommande] = useState({
        libelle: "",
        date: "",
        time: "",
        paye: null
    });
    const [dates, setDates] = useState([]);
    const [visibleDatesCount, setVisibleDatesCount] = useState(5);
    const [tranches, setTranches] = useState([]);
    const [types, setTypes] = useState([]);
    const [isMidiSoir, setIsMidiSoir] = useState({ "midi": 1, "soir": 1 });
    const [produitsAffiches, setproduitsAffiches] = useState([]);
    const [produitsCommandes, setProduitsCommandes] = useState([]);
    const [tempId, setTempId] = useState(0);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();

    const [showModalCustom, setModalCustom] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModalBoissons, setModalBoissons] = useState(false);
    const [showConfirm, setshowConfirm] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [datesRes, tranchesRes, typesRes, produitsRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_URL}dates`),
                    axios.get(`${process.env.REACT_APP_API_URL}tranches`),
                    axios.get(`${process.env.REACT_APP_API_URL}produits/types`),
                    axios.get(`${process.env.REACT_APP_API_URL}produits/produitsAffiches`)
                ]);

                setDates(datesRes.data.reverse());
                setIsMidiSoir({ "midi": datesRes.data[0].cb_midi, "soir": datesRes.data[0].cb_soir });
                setTranches(tranchesRes.data);

                // Keep all types for grouped display
                setTypes(typesRes.data);
                setproduitsAffiches(produitsRes.data);
            } catch (err) {
                console.error("Erreur lors de l'initialisation :", err);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (commandeId) {
            axios.get(process.env.REACT_APP_API_URL + `commandes/id/${commandeId}`)
                .then((response) => {
                    setCommande(({
                        libelle: response.data.libelle,
                        date: moment(response.data.date_commande).format('YYYY-MM-DD'),
                        time: moment(response.data.date_commande).format('HH:mm'),
                        paye: response.data.moyen_paiement
                    }));
                    setProduitsCommandes(response.data.produits);
                    setTempId(response.data.produits.length);
                })
                .catch((error) => {
                    console.error("Erreur lors de la récupération de la commande existante :", error);
                });
        }
    }, [commandeId]);

    useEffect(() => {
        if (commande.date === "") return;
        axios.get(`${process.env.REACT_APP_API_URL}dates/id/${commande.date}`)
            .then((res) => {
                setIsMidiSoir({ "midi": res.data.cb_midi, "soir": res.data.cb_soir });
            })
            .catch((error) => {
                console.error("Erreur lors de la récupération de la date", error);
            });
    }, [commande.date]);

    const formatDate = (date) => {
        return moment(date).format('dddd D MMMM');
    };

    const handleClick = (id) => {
        const produit = produitsAffiches.find(p => p.id_produit === id);
        if (!produit) return;

        switch (produit.action) {
            case "modifier":
                modifierCommande(produit.id_produit, 1);
                break;
            case "setModalBoissons":
                setModalBoissons(true);
                break;
            default:
                break;
        }
    };

    const validerCommande = async () => {
        if (produitsCommandes.length === 0) {
            alert("Attention, la commande est vide !");
            return false;
        }

        const dateFinale = commande.date || (dates.length > 0 ? dates[0].jour : moment().format('YYYY-MM-DD'));
        const timeFinal = commande.time || (tranches.length > 0 ? tranches[0].tranche : "12:00");
        const updatedCommande = {
            libelle: commande.libelle || "Nouvelle Commande",
            date_commande: `${dateFinale} ${timeFinal}:00`,
            produits: produitsCommandes
        };

        try {
            if (commandeId) await axios.post(process.env.REACT_APP_API_URL + "commandes/update/" + commandeId, updatedCommande);
            else await axios.post(process.env.REACT_APP_API_URL + "commandes", updatedCommande);
            navigate("/commandes");
        } catch (error) {
            console.error("Erreur lors de la validation :", error);
        }
    };

    const modifierCommande = (id, qte) => {
        let id_pc = -1;

        if (qte === -1) {
            id_pc = produitsCommandes.findIndex((p) => (p.tempId === id));
        } else {
            id_pc = produitsCommandes.findIndex((p) => (p.id_produit === id) && (!p.modifications || p.modifications.length === 0) && (p.custom === 0));
        }

        if (id_pc !== -1) {
            const pc_clone = [...produitsCommandes];
            pc_clone[id_pc].qte += qte;
            if (pc_clone[id_pc].qte < 1) pc_clone.splice(id_pc, 1);
            setProduitsCommandes(pc_clone);
        } else {
            const produit = produitsAffiches.find(p => p.id_produit === id);
            if (produit) {
                setProduitsCommandes([...produitsCommandes, {
                    id_produit: produit.id_produit,
                    nom: produit.nom,
                    prix: produit.prix_produit || produit.prix,
                    qte: 1,
                    tempId: tempId,
                    custom: 0
                }]);
                setTempId(tempId + 1);
            }
        }
    };

    useEffect(() => {
        const new_total = produitsCommandes.reduce((acc, p) => acc + (p.qte * p.prix), 0);
        setTotal(new_total);
    }, [produitsCommandes]);

    const CloseModalCustom = (modifications, nouveauPrix) => {
        setModalCustom(false);
        const id_pc = produitsCommandes.findIndex((p) => p.tempId === selectedProduct.tempId);
        if (id_pc === -1) return;

        const pc_clone = [...produitsCommandes];
        pc_clone[id_pc].modifications = modifications;
        if (pc_clone[id_pc].prix !== parseFloat(nouveauPrix)) {
            pc_clone[id_pc].prix = parseFloat(nouveauPrix);
            pc_clone[id_pc].custom = 1;
        }

        setProduitsCommandes(pc_clone);
    };

    const CloseModalBoisson = (id) => {
        setModalBoissons(false);
        if (id !== 0) modifierCommande(id, 1);
    };

    const supprimerCommande = async (confirm) => {
        setshowConfirm(false);
        if (confirm) {
            await axios.delete(process.env.REACT_APP_API_URL + "commandes/supprimer/" + commandeId);
            navigate("/commandes");
        }
    };

    return (
        <div className="absolute inset-0 flex bg-slate-900 text-white gap-4 p-4 box-border overflow-hidden">

            {/* Left Section: All Products (Continuous list & Independent scroll) */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                    {/* Normal Products */}
                    {produitsAffiches.filter(p => p.display === 1).map(produit => (
                        <button
                            key={produit.id_produit}
                            onClick={() => handleClick(produit.id_produit)}
                            className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-2xl hover:border-emerald-500/50 hover:bg-slate-800 transition-all text-left flex flex-col justify-between group h-28"
                        >
                            <div className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                                <Plus className="w-3.5 h-3.5 group-hover:text-slate-900" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-100 mb-0.5 line-clamp-1">{produit.nom}</h3>
                                <p className="text-emerald-400 font-black text-xs">{produit.prix_produit} €</p>
                            </div>
                        </button>
                    ))}

                    {/* Specials/Sides Category */}
                    {produitsAffiches.filter(p => p.display === -1).map(produit => (
                        <button
                            key={produit.id_produit}
                            onClick={() => handleClick(produit.id_produit)}
                            className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-2xl hover:border-amber-500/50 hover:bg-slate-800 transition-all text-left flex items-center justify-between group h-20"
                        >
                            <div>
                                <h3 className="text-base font-bold text-slate-100">{produit.nom}</h3>
                            </div>
                            <div className="w-8 h-8 bg-slate-700 rounded-xl flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                                {produit.id_produit === 98 ? <Beer className="w-4 h-4 text-amber-400 group-hover:text-slate-900" /> : <Plus className="w-4 h-4 group-hover:text-slate-900" />}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Section: Order Ticket (Fixed position & Independent scroll) */}
            <div className="w-72 flex flex-col bg-slate-800 border border-slate-700 rounded-[2rem] shadow-2xl overflow-hidden shrink-0 h-full">

                {/* Ticket Header */}
                <div className="p-4 bg-slate-900/50 border-b border-slate-700 space-y-3">
                    <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-1.5 border border-slate-700 focus-within:border-emerald-500 transition-all">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <input
                            type="text"
                            className="bg-transparent border-none outline-none flex-1 font-bold text-white placeholder:text-slate-600 text-xs"
                            placeholder="Nom du client"
                            value={commande.libelle}
                            onChange={(e) => setCommande(prev => ({ ...prev, libelle: e.target.value }))}
                        />
                    </div>

                    {/* Aligned Selects on one line */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-2 py-1 border border-slate-700">
                            <CalendarIcon className="w-3 h-3 text-slate-500 shrink-0" />
                            <select
                                className="bg-transparent border-none outline-none text-[10px] font-bold w-full cursor-pointer"
                                value={commande.date}
                                onChange={(e) => {
                                    if (e.target.value === "load_more") {
                                        setVisibleDatesCount(prev => prev + 5);
                                    } else {
                                        setCommande(prev => ({ ...prev, date: e.target.value }));
                                    }
                                }}
                            >
                                {dates.slice(0, visibleDatesCount).map((date, idx) => (
                                    <option key={idx} value={date.jour} className="bg-slate-800">{formatDate(date.jour)}</option>
                                ))}
                                {visibleDatesCount < dates.length && (
                                    <option value="load_more" className="bg-slate-700 text-emerald-400 font-bold">Voir plus...</option>
                                )}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-2 py-1 border border-slate-700">
                            <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                            <select
                                className="bg-transparent border-none outline-none text-[10px] font-bold w-full cursor-pointer"
                                value={commande.time}
                                onChange={(e) => setCommande(prev => ({ ...prev, time: e.target.value }))}
                            >
                                {tranches.map((tranche, idx) => (
                                    ((tranche.is_midi === 1 && isMidiSoir["midi"] === 1) || (tranche.is_midi === 0 && isMidiSoir["soir"] === 1)) && (
                                        <option key={idx} className="bg-slate-800">{tranche.tranche}</option>
                                    )
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Ticket Body: Items List */}
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
                    {produitsCommandes.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                            <ShoppingCart className="w-10 h-10 mb-2" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Vide</p>
                        </div>
                    ) : (
                        produitsCommandes.map((produit, index) => (
                            <div key={index} className="animate-in slide-in-from-right duration-300">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-slate-900 rounded-md flex items-center overflow-hidden border border-slate-700">
                                                <button
                                                    onClick={() => modifierCommande(produit.tempId, -1)}
                                                    className="p-0.5 px-1.5 hover:bg-red-500/20 text-red-500 transition-colors"
                                                >
                                                    {produit.qte === 1 ? <Trash2 className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
                                                </button>
                                                <span className="px-1 font-black text-[11px] min-w-[1rem] text-center">{produit.qte}</span>
                                                <button
                                                    onClick={() => modifierCommande(produit.id_produit, 1)}
                                                    className="p-0.5 px-1.5 hover:bg-emerald-500/20 text-emerald-500 transition-colors"
                                                >
                                                    <Plus className="w-2.5 h-2.5" />
                                                </button>
                                            </div>
                                            <span
                                                className={`font-black text-base cursor-pointer hover:text-emerald-400 transition-colors leading-tight ${produit.custom === 1 ? 'text-amber-400' : 'text-slate-100'}`}
                                                onClick={() => { setSelectedProduct(produit); setModalCustom(true); }}
                                            >
                                                {produit.nom}
                                            </span>
                                        </div>
                                        {produit.modifications && produit.modifications.map((modif, midx) => (
                                            <div
                                                key={midx}
                                                className={`text-[10px] ml-11 mt-0.5 flex items-center gap-1 font-black uppercase tracking-wider ${modif.modificateur === -1 ? 'text-modification-remove' :
                                                    modif.modificateur === 1 ? 'text-modification-add' :
                                                        'text-modification-change'
                                                    }`}
                                            >
                                                {modif.modificateur === -1 ? "- " : modif.modificateur === 1 ? "+ " : "~ "}{modif.nom}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-right font-mono font-black text-slate-400 text-sm pl-2">
                                        {(produit.prix * produit.qte).toFixed(1)}€
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Ticket Footer: Total & Validation (Always visible) */}
                <div className="p-4 bg-slate-900/80 border-t border-slate-700 space-y-3 pb-10">
                    <div className="flex justify-between items-end">
                        <span className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Total</span>
                        <div className="text-right">
                            {commande.paye && (
                                <p className="text-[10px] text-emerald-400 font-bold mb-1 flex items-center justify-end gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> PAYÉ
                                </p>
                            )}
                            <span className="text-2xl font-black text-white font-mono leading-none">{total.toFixed(1)}€</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {commandeId && (
                            <button
                                onClick={() => setshowConfirm(true)}
                                className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={validerCommande}
                            disabled={produitsCommandes.length === 0}
                            className={`flex-1 p-2.5 rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all ${produitsCommandes.length === 0
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/10 active:scale-95'
                                }`}
                        >
                            {commandeId ? "Modifier" : "Enregistrer"}
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showModalCustom && (
                <ModalCustomProduit
                    produit={selectedProduct}
                    onClose={CloseModalCustom}
                />
            )}
            {showModalBoissons && (
                <ModalBoissons onClose={CloseModalBoisson} />
            )}
            {showConfirm && (
                <Confirm
                    message="Voulez-vous vraiment supprimer cette commande ?"
                    onClose={supprimerCommande}
                />
            )}
        </div>
    );
};

export default NouvelleCommande;
