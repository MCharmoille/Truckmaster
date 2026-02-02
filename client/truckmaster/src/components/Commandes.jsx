import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import Modal from "./modals/Paiement";
import Calendrier from './Calendrier';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, CheckCircle } from 'lucide-react';

const Commandes = () => {
  const [commandes, setCommandes] = useState([]);
  const [tranches, setTranches] = useState([]);
  const [selectedDate, setSelectedDate] = useState({ jour: null, cb_midi: true, cb_soir: true });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommandesForDate = async () => {
      if (selectedDate.jour !== null) {
        try {
          const formattedDate = moment(selectedDate.jour).format('YYYY-MM-DD');

          const res = await axios.get(`${process.env.REACT_APP_API_URL}commandes/date/${formattedDate}`);
          setCommandes(res.data);

          const new_tranches = [];
          res.data.forEach((commande) => {
            const timeCommande = moment(commande.date_commande).format('HH:mm');

            const foundTranche = new_tranches.find((tranche) => tranche.time === timeCommande);

            if (foundTranche) {
              foundTranche.content.push(commande);
            } else {
              new_tranches.push({ time: timeCommande, type: timeCommande.substring(0, 2) < 16 ? 1 : 2, content: [commande] });
            }
          });

          setTranches(new_tranches);
        } catch (err) {
          console.log(err);
        }
      }
    };

    fetchCommandesForDate();
  }, [selectedDate]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const [showModal, setShowModal] = useState(false);
  const [selectedCommande, setselectedCommande] = useState(null);

  const handleCloseModal = (moyen_paiement) => {
    setShowModal(false);

    if (moyen_paiement !== 0) {
      const id_c = commandes.findIndex((c) => (c.id_commande === selectedCommande.id_commande));

      if (id_c !== -1) {
        const c_clone = [...commandes];
        c_clone[id_c].moyen_paiement = moyen_paiement;
        setCommandes(c_clone);
      }
    }
  };

  const paiement_commande = (commande) => {
    setselectedCommande(commande);
    setShowModal(true);
  };

  const toggleFilter = async (filterName) => {
    const newValue = !selectedDate[filterName];
    setSelectedDate({ ...selectedDate, [filterName]: newValue });

    try {
      await axios.post(process.env.REACT_APP_API_URL + "dates/updateCb", { id_date: selectedDate.id_date, cb: [filterName], checked: newValue });
    } catch (error) {
      console.error("Une erreur s'est produite lors de la requête POST :", error);
    }
  };

  return (
    <div className="w-full min-h-full pb-36 px-2 md:px-4">

      {/* Date Picker */}
      <div className="mb-8">
        <Calendrier onDateChange={handleDateChange} />
      </div>

      {/* Midi / Soir Filters */}
      <div className="flex justify-center gap-6 mb-10">
        <button
          onClick={() => toggleFilter('cb_midi')}
          className={`px-8 py-3 rounded-2xl text-xl font-bold transition-all duration-300 shadow-lg flex items-center gap-3 border ${selectedDate.cb_midi
            ? 'bg-emerald-600 text-white border-emerald-500 scale-105 shadow-emerald-500/20'
            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
        >
          <Sun className="w-6 h-6" /> Midi
        </button>

        <button
          onClick={() => toggleFilter('cb_soir')}
          className={`px-8 py-3 rounded-2xl text-xl font-bold transition-all duration-300 shadow-lg flex items-center gap-3 border ${selectedDate.cb_soir
            ? 'bg-blue-600 text-white border-blue-500 scale-105 shadow-blue-500/20'
            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
        >
          <Moon className="w-6 h-6" /> Soir
        </button>
      </div>

      {/* Tranches (Time Slots) */}
      <div className="space-y-8">
        {tranches.map((tranche, t_index) => (
          <div
            className={`bg-slate-800/50 rounded-3xl p-3 md:p-4 border border-slate-700/50 backdrop-blur-sm ${(tranche.type === 1 ? !selectedDate.cb_midi : !selectedDate.cb_soir) ? "hidden" : ""
              }`}
            key={t_index}
          >
            {/* Time Slot Header */}
            <h2 className="text-3xl font-bold text-slate-200 mb-4 border-b border-slate-700 pb-2 pl-2 flex items-center gap-3">
              {tranche.time}
            </h2>

            {/* Orders Grid */}
            <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
              {tranche.content.length !== 0 ? (
                tranche.content.map((commande, c_index) => (
                  <div
                    className={`
                      relative p-3 rounded-[1.5rem] border transition-all duration-300 group cursor-pointer shadow-lg
                      ${commande.moyen_paiement !== null
                        ? 'bg-emerald-900/20 border-emerald-500/30 hover:bg-emerald-900/30'
                        : 'bg-slate-800 border-slate-700 hover:border-blue-500 hover:shadow-blue-500/10 hover:-translate-y-1'
                      }
                    `}
                    key={c_index}
                    onClick={() => navigate("/add/" + commande.id_commande)}
                  >

                    {/* Card Header (Legacy Content Wrapper) */}
                    <h2 className="text-2xl font-bold text-white mb-2 pb-2 border-b border-slate-700/50 flex justify-between gap-1 items-start">
                      <span className="truncate">{commande.libelle}</span>
                      <span className={`${commande.moyen_paiement !== null ? "text-emerald-400" : "text-blue-400"} shrink-0 font-mono`}>
                        {commande.total}€
                      </span>
                    </h2>

                    {/* Content (Legacy Structure - To be modernized later) */}
                    <div className='produits space-y-1.5 mb-4'>
                      {commande.produits.length !== 0 ? (
                        commande.produits.map((produit, p_index) => (
                          <div className='produit text-lg text-slate-300 leading-tight' key={p_index}>
                            <span className={produit.custom === 1 ? 'text-modification-custom font-bold' : ''}>
                              {produit.qte}x {produit.nom} {produit.custom === 1 ? `(${produit.prix}€)` : ""}
                            </span>
                            {produit.modifications.length !== 0 ? (
                              produit.modifications.map((modif, m_index) => (
                                <div
                                  key={m_index}
                                  className={`text-[10px] ml-6 mt-0.5 flex items-center gap-1 font-black uppercase tracking-wider ${modif.modificateur === -1 ? 'text-modification-remove' :
                                    modif.modificateur === 1 ? 'text-modification-add' :
                                      'text-modification-change'
                                    }`}
                                >
                                  {modif.modificateur === -1 ? "- " : modif.modificateur === 1 ? "+ " : "~ "}{modif.nom}
                                </div>
                              ))
                            ) : ""
                            }
                          </div>
                        ))
                      ) : ""
                      }
                    </div>

                    {/* Payment Footer */}
                    {commande.moyen_paiement !== null ? (
                      <div className="mt-2 pt-2 border-t border-slate-700/50 text-emerald-400 text-sm font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> {commande.moyen_paiement === "c" ? "CB" : (commande.moyen_paiement === "o" ? "Offert" : (commande.moyen_paiement === "v" ? "Vir." : "Esp."))}
                      </div>
                    ) : (
                      <button
                        className='w-full mt-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-bold transition-colors shadow-lg shadow-emerald-600/20'
                        onClick={(e) => {
                          e.stopPropagation();
                          paiement_commande(commande);
                        }}
                      >
                        Encaisser
                      </button>
                    )}
                  </div>
                ))
              ) : ""
              }
            </div>
          </div>
        ))}
      </div>

      {/* Afficher la fenêtre modale si showModal est true */}
      {
        showModal && (
          <Modal commande={selectedCommande} onClose={handleCloseModal} />
        )
      }
    </div >
  );
};

export default Commandes;