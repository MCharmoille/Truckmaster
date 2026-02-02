import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/fr'; // Ensure French locale is loaded
import { DollarSign, Calendar, Trophy, ArrowRight } from 'lucide-react';

const Statistiques = () => {
    // Default: Last 6 months
    const [startDate, setStartDate] = useState(moment().subtract(5, 'months').startOf('month').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(moment().endOf('month').format('YYYY-MM-DD'));

    const [data, setData] = useState([]);
    const [inclureOffert, setInclureOffer] = useState(false);
    const [inclureNonPaye, setInclureNonPaye] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    moment.locale('fr');

    const handleQuickRange = (months) => {
        setStartDate(moment().subtract(months - 1, 'months').startOf('month').format('YYYY-MM-DD'));
        setEndDate(moment().endOf('month').format('YYYY-MM-DD'));
    };

    useEffect(() => {
        const fetchStatistiques = async () => {
            setIsLoading(true);
            try {
                // Ensure we send full date strings (start of month / end of month)
                const s = moment(startDate).startOf('month').format('YYYY-MM-DD');
                const e = moment(endDate).endOf('month').format('YYYY-MM-DD');

                const res = await axios.get(`${process.env.REACT_APP_API_URL}commandes/statistiques`, {
                    params: { startDate: s, endDate: e }
                });

                // Sort data by date
                const sortedData = res.data.statistiques.sort((a, b) => moment(a.mois).diff(moment(b.mois)));
                setData(sortedData);
                setIsLoading(false);
            } catch (err) {
                console.log(err);
                setIsLoading(false);
            }
        };
        fetchStatistiques();
    }, [startDate, endDate]);

    // Helpers
    const getTotalForMonth = (paiements) => {
        return paiements.reduce((total, paiement) => {
            if ((paiement.nom === 'Offert' && inclureOffert) ||
                (paiement.nom === 'Non payé' && inclureNonPaye) ||
                (paiement.nom !== 'Offert' && paiement.nom !== 'Non payé')) {
                return total + paiement.valeur;
            }
            return total;
        }, 0);
    };

    // KPIs (calculated on fetched data which is already filtered by API)
    const totalCa = data.reduce((acc, curr) => acc + getTotalForMonth(curr.paiements), 0);
    const averageCa = data.length > 0 ? (totalCa / data.length).toFixed(0) : 0;
    const maxMonth = data.reduce((max, curr) => {
        const val = getTotalForMonth(curr.paiements);
        return val > max ? val : max;
    }, 0);

    return (
        <div className="w-full min-h-screen bg-slate-900 p-6 md:p-12 pb-32">

            {/* Header & Controls */}
            <div className="flex flex-col xl:flex-row justify-between items-center mb-10 gap-6">

                <div className='flex items-center gap-4'>
                    <h1 className="text-4xl font-bold text-white">Statistiques</h1>
                </div>

                {/* Filters Container */}
                <div className="flex flex-col md:flex-row gap-4 items-center">

                    {/* Time Range Presets */}
                    <div className="flex bg-slate-800 p-1.5 rounded-xl border border-slate-700">
                        {[3, 6, 12, 24].map(range => (
                            <button
                                key={range}
                                onClick={() => handleQuickRange(range)}
                                className={`px-4 py-2 rounded-lg font-bold transition-all text-sm md:text-base ${moment(startDate).isSame(moment().subtract(range - 1, 'months').startOf('month'), 'day')
                                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                {range} Mois
                            </button>
                        ))}
                    </div>

                    {/* Manual Date Pickers */}
                    <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700">
                        <input
                            type="month"
                            className="bg-transparent text-white font-bold outline-none cursor-pointer"
                            value={moment(startDate).format('YYYY-MM')}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <ArrowRight className="w-5 h-5 text-slate-500" />
                        <input
                            type="month"
                            className="bg-transparent text-white font-bold outline-none cursor-pointer"
                            value={moment(endDate).format('YYYY-MM')}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

                <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/50 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="w-20 h-20 text-white" />
                    </div>
                    <p className="text-slate-400 text-lg mb-2">Chiffre d'Affaires</p>
                    <h3 className="text-5xl font-extrabold text-white">{totalCa.toLocaleString('fr-FR')} €</h3>
                    <p className="text-emerald-400 text-sm mt-4 font-bold flex items-center gap-1">
                        Sur la période sélectionnée
                    </p>
                </div>

                {/* Average */}
                <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/50 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar className="w-20 h-20 text-white" />
                    </div>
                    <p className="text-slate-400 text-lg mb-2">Moyenne Mensuelle</p>
                    <h3 className="text-5xl font-extrabold text-cyan-400">{Number(averageCa).toLocaleString('fr-FR')} €</h3>
                    <p className="text-slate-500 text-sm mt-4">Un indicateur de stabilité</p>
                </div>

                {/* Best Month */}
                <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/50 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Trophy className="w-20 h-20 text-white" />
                    </div>
                    <p className="text-slate-400 text-lg mb-2">Meilleur Mois</p>
                    <h3 className="text-5xl font-extrabold text-yellow-400">{maxMonth.toLocaleString('fr-FR')} €</h3>
                    <p className="text-slate-500 text-sm mt-4">Record de la période</p>
                </div>

            </div>

            {/* Chart Section */}
            <div className="bg-slate-800/50 rounded-3xl p-8 border border-slate-700/50 mb-12 backdrop-blur-sm overflow-hidden">
                <h3 className="text-2xl font-bold text-white mb-8">Évolution du CA</h3>

                {/* Scrollable Container */}
                <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
                    <div className="h-64 flex items-end gap-3 md:gap-4 min-w-max px-2" style={{ minWidth: `${data.length * 80}px` }}>
                        {data.map((d, index) => {
                            const total = getTotalForMonth(d.paiements);
                            const heightPercent = maxMonth > 0 ? (total / maxMonth) * 100 : 0;
                            const isMax = total === maxMonth && maxMonth > 0;

                            return (
                                <div key={index} className="w-16 md:w-20 flex flex-col items-center group relative h-full justify-end">
                                    {/* Value Tooltip (visible on hover) */}
                                    <div className="absolute -top-12 bg-slate-900 border border-slate-600 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap font-mono">
                                        {total} €
                                    </div>

                                    {/* Bar */}
                                    <div
                                        className={`w-full rounded-t-lg transition-all duration-700 ease-out flex items-end justify-center pb-2
                                            ${isMax
                                                ? 'bg-gradient-to-t from-yellow-600 to-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)]'
                                                : 'bg-gradient-to-t from-cyan-900 to-cyan-500 opacity-80 hover:opacity-100'
                                            }
                                        `}
                                        style={{ height: `${heightPercent}%` }}
                                    >
                                        {/* Show value inside bar if tall enough, else nothing */}
                                    </div>

                                    {/* Label */}
                                    <p className="text-slate-400 text-xs md:text-sm mt-3 font-medium rotate-0 truncate w-full text-center">
                                        {moment(d.mois, 'YYYY-MM').format('MMM YY').toUpperCase()}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Monthly Details Grid */}
            <h3 className="text-2xl font-bold text-white mb-6">Détails Mensuels</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {data.slice().reverse().map((monthData, index) => (
                    <div key={index} className='bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors'>
                        <div className="flex justify-between items-start mb-4 border-b border-slate-700 pb-3">
                            <h3 className="text-xl font-bold text-white capitalize">
                                {moment(monthData.mois, 'YYYY-MM').format('MMMM YYYY')}
                            </h3>
                            <span className="text-emerald-400 font-bold bg-emerald-900/30 px-3 py-1 rounded-full text-sm">
                                {getTotalForMonth(monthData.paiements)} €
                            </span>
                        </div>

                        <ul className="space-y-2">
                            {monthData.paiements.map((paiement) => (
                                <li key={paiement.id} className="flex justify-between text-slate-300 text-sm">
                                    <span>{paiement.nom}</span>
                                    <span className="font-mono text-slate-400">{paiement.valeur} €</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Options Footer */}
            <div className='mt-12 flex justify-center gap-8 text-slate-400'>
                <label className='flex items-center gap-3 cursor-pointer hover:text-white transition-colors select-none'>
                    <input type="checkbox" className='w-5 h-5 accent-cyan-500' checked={inclureOffert} onChange={() => setInclureOffer(!inclureOffert)} />
                    Inclure les offerts
                </label>
                <label className='flex items-center gap-3 cursor-pointer hover:text-white transition-colors select-none'>
                    <input type="checkbox" className='w-5 h-5 accent-cyan-500' checked={inclureNonPaye} onChange={() => setInclureNonPaye(!inclureNonPaye)} />
                    Inclure les non payés
                </label>
            </div>

        </div>
    );
};

export default Statistiques;
