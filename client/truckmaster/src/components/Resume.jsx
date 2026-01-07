import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import Calendrier from './Calendrier';
import { Link } from 'react-router-dom';
import { Calendar, CreditCard } from 'lucide-react';

const Resume = () => {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchCommandesForDate = async () => {
      if (selectedDate) {
        try {
          const formattedDate = moment(selectedDate).format('YYYY-MM-DD');

          const res = await axios.get(`${process.env.REACT_APP_API_URL}commandes/resume/${formattedDate}`);
          setData(res.data);
        } catch (err) {
          console.log(err);
        }
      }
    };
    fetchCommandesForDate();
  }, [selectedDate]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate.jour);
  };

  // Calculate total payments
  const totalPaiements = data.length !== 0 ? data.paiements.reduce((acc, curr) => acc + curr.valeur, 0) : 0;

  return (
    <div className="w-full min-h-full max-w-7xl mx-auto p-4 md:p-8 animate-fade-in pb-4">

      <div className="mb-8 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 backdrop-blur-sm">
        <Calendrier onDateChange={handleDateChange} />
      </div>

      {data.length !== 0 ? (
        <div className="flex flex-col gap-10">

          {/* Section: Totaux par Type de Produit */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {data.type_produit.map((tp, tp_index) => (
              <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col gap-6 relative overflow-hidden group" key={tp_index}>

                {/* Header Card */}
                <div className="flex items-center gap-6 border-b border-slate-700/50 pb-6">
                  <div className="w-20 h-20 bg-slate-700/50 rounded-2xl p-3 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                    <img className="w-full h-full object-contain drop-shadow-md" src={require(`../img/type_produit/${tp.id_type}.png`)} alt={tp.nom} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white tracking-wide">{tp.nom}</h3>
                    {tp.qte !== 0 && tp.id_type !== 4 && (
                      <span className="text-emerald-400 font-bold text-2xl">Total : {tp.qte}</span>
                    )}
                  </div>
                </div>

                {/* List of Products */}
                <div className="flex-1 overflow-y-auto max-h-80 pr-2 space-y-3 custom-scrollbar">
                  {tp.produits.length !== 0 ? (
                    tp.produits.map((produit, pr_index) => (
                      <div key={pr_index} className="flex justify-between items-center text-slate-300 bg-slate-800/50 p-3 rounded-xl border border-slate-700/30">
                        <span className="font-medium text-xl">{produit.nom}</span>
                        <span className="font-bold text-white bg-slate-700 px-4 py-2 rounded-full text-lg">x{produit.qte}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 italic text-center text-xl py-4">Aucune vente</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Section: Paiements */}
          <div className="bg-gradient-to-br from-emerald-900/40 to-slate-800 rounded-3xl p-8 border border-emerald-500/20 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-10 z-10 relative">

              {/* Icon & Grand Total */}
              <div className="flex flex-col items-center gap-4 bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20 min-w-[300px]">
                <div className="w-24 h-24 bg-emerald-500/20 p-5 rounded-full flex items-center justify-center">
                  <CreditCard className="w-12 h-12 text-emerald-400" />
                </div>
                <div className="text-center">
                  <p className="text-emerald-400 text-xl uppercase font-bold tracking-widest">Chiffre d'Affaires</p>
                  <p className="text-6xl font-extrabold text-white mt-2 drop-shadow-lg">{totalPaiements} €</p>
                </div>
              </div>

              {/* Payment Methods Grid */}
              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                {data.paiements.map((p, p_index) => (
                  <div key={p_index} className="bg-slate-900/60 p-6 rounded-2xl border border-emerald-500/30 flex flex-col items-center justify-center text-center gap-2 hover:bg-slate-900/80 transition-colors">
                    <span className="text-slate-400 text-lg uppercase font-bold tracking-wider">{p.nom}</span>
                    <span className="text-4xl font-bold text-white">{p.valeur} €</span>
                  </div>
                ))}
              </div>
            </div>
          </div>



        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <Calendar className="w-20 h-20 text-slate-400 mb-6" />
          <p className="text-3xl text-slate-400 font-medium text-center">Sélectionnez une date ci-dessus<br />pour voir le résumé de la journée.</p>
        </div>
      )}
    </div>
  );
};

export default Resume;