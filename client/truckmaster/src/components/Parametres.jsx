import { React, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import fr from 'date-fns/locale/fr';
import moment from 'moment';
import 'moment/locale/fr';

const Parametres = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [dates, setDates] = useState([]);
  const [tranches, setTranches] = useState([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [AddMidiOpen, setAddMidiOpen] = useState(false);
  const [AddSoirOpen, setAddSoirOpen] = useState(false);

  // Collapse states
  const [isDatesExpanded, setIsDatesExpanded] = useState(true);
  const [isSlotsExpanded, setIsSlotsExpanded] = useState(true);

  // Pagination state
  const [datesLimit, setDatesLimit] = useState(5);

  // Controlled inputs for new tranches
  const [tempMidiTranche, setTempMidiTranche] = useState("");
  const [tempSoirTranche, setTempSoirTranche] = useState("");

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    navigate("/");
  };

  const formatDateLabel = (date) => {
    return moment(date).format('dddd D MMMM');
  };

  const getDates = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}dates`);
      // Keeping all dates in state, we'll slice them in the render
      setDates(res.data.reverse());
    } catch (err) {
      console.log(err);
    }
  }

  const getTranches = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}tranches`);
      setTranches(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    getDates();
    getTranches();
  }, []);

  const addDate = async (date) => {
    try {
      await axios.post(process.env.REACT_APP_API_URL + "dates/addDate", { jour: date, cb_midi: 1, cb_soir: 1 });
      getDates();
      setCalendarOpen(false);
    } catch (error) {
      console.error("Une erreur s'est produite lors de l'ajout de la date :", error);
    }
  };

  const deleteDate = async (date) => {
    try {
      await axios.post(process.env.REACT_APP_API_URL + "dates/deleteDate", { id_date: date.id_date });
      getDates();
    } catch (error) {
      console.error("Une erreur s'est produite lors de la suppression d'une date :", error);
    }
  };

  const addTranche = async (is_midi) => {
    try {
      const tranche = is_midi ? tempMidiTranche : tempSoirTranche;

      if (tranche.length !== 5) return;
      await axios.post(process.env.REACT_APP_API_URL + "tranches/addTranche", { tranche: tranche, is_midi: is_midi });
      getTranches();

      if (is_midi) {
        setAddMidiOpen(false);
        setTempMidiTranche("");
      } else {
        setAddSoirOpen(false);
        setTempSoirTranche("");
      }
    } catch (error) {
      console.error("Une erreur s'est produite lors de l'ajout de la tranche :", error);
    }
  };

  const deleteTranche = async (tranche) => {
    try {
      await axios.post(process.env.REACT_APP_API_URL + "tranches/deleteTranche", { id_tranche: tranche.id_tranche });
      getTranches();
    } catch (error) {
      console.error("Une erreur s'est produite lors de la suppression d'une tranche :", error);
    }
  };

  const checkCb = async (date, event) => {
    try {
      await axios.post(process.env.REACT_APP_API_URL + "dates/updateCb", { id_date: date.id_date, cb: [event.target.name], checked: event.target.checked });
      getDates();
    } catch (error) {
      console.error("Une erreur s'est produite lors de la requête POST :", error);
    }
  };

  return (
    <div className="w-full min-h-full bg-slate-900 text-white p-4 md:p-8 pb-32 max-w-5xl mx-auto space-y-12">

      {/* Header Section */}
      <div className="flex justify-between items-center bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-sm">
        <div>
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-slate-400">Gérez vos jours de travail et horaires</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/50 px-6 py-2 rounded-xl transition-all duration-300 font-bold flex items-center gap-2"
        >
          <span>🚪</span> Déconnexion
        </button>
      </div>

      {/* Jours Travaillés Section */}
      <section className="bg-slate-800/30 rounded-3xl border border-slate-700/50 overflow-hidden shadow-xl">
        <div
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-700/20 transition-colors"
          onClick={() => setIsDatesExpanded(!isDatesExpanded)}
        >
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
            Jours de travail
          </h2>
          <div className="flex items-center gap-4">
            <span className={`text-2xl transition-transform duration-300 ${isDatesExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
        </div>

        {isDatesExpanded && (
          <div className="p-6 border-t border-slate-700/50 animate-fade-in">
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => setCalendarOpen(!calendarOpen)}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl transition-all font-bold shadow-lg shadow-emerald-500/20"
              >
                <span>📅</span> {calendarOpen ? "Fermer le calendrier" : "Ajouter une date"}
              </button>
            </div>

            {calendarOpen && (
              <div className="flex justify-center bg-slate-800 p-6 rounded-3xl border border-emerald-500/30 mb-8 animate-fade-in shadow-xl shadow-emerald-500/5">
                <DatePicker
                  onChange={addDate}
                  inline
                  locale={fr}
                />
              </div>
            )}

            <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/80 text-slate-400 text-xs md:text-sm uppercase tracking-wider">
                      <th className="px-6 py-4 font-bold">Jour</th>
                      <th className="px-6 py-4 font-bold text-center">Midi</th>
                      <th className="px-6 py-4 font-bold text-center">Soir</th>
                      <th className="px-6 py-4 font-bold text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {dates.slice(0, datesLimit).map((date, d_index) => (
                      <tr key={d_index} className="hover:bg-slate-700/30 transition-colors group">
                        <td className="px-4 md:px-6 py-4 font-medium text-slate-200 capitalize text-sm md:text-base">
                          {formatDateLabel(date.jour)}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            name="cb_midi"
                            className="w-7 h-7 rounded-lg bg-slate-700 border-slate-600 accent-emerald-500 cursor-pointer"
                            checked={date.cb_midi}
                            onChange={(e) => checkCb(date, e)}
                          />
                        </td>
                        <td className="px-4 md:px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            name="cb_soir"
                            className="w-7 h-7 rounded-lg bg-slate-700 border-slate-600 accent-emerald-500 cursor-pointer"
                            checked={date.cb_soir}
                            onChange={(e) => checkCb(date, e)}
                          />
                        </td>
                        <td className="px-4 md:px-6 py-4 text-right">
                          <button
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            onClick={() => deleteDate(date)}
                          >
                            <span className="text-xl">🗑️</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {datesLimit < dates.length && (
              <button
                onClick={() => setDatesLimit(prev => prev + 5)}
                className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all border border-slate-700 flex items-center justify-center gap-2 group"
              >
                <span className="text-xl group-hover:scale-125 transition-transform">+</span> Afficher plus de dates
              </button>
            )}
          </div>
        )}
      </section>

      {/* Tranches Horaires Section */}
      <section className="bg-slate-800/30 rounded-3xl border border-slate-700/50 overflow-hidden shadow-xl">
        <div
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-700/20 transition-colors"
          onClick={() => setIsSlotsExpanded(!isSlotsExpanded)}
        >
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="w-2 h-8 bg-cyan-500 rounded-full"></span>
            Tranches horaires
          </h2>
          <span className={`text-2xl transition-transform duration-300 ${isSlotsExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>

        {isSlotsExpanded && (
          <div className="p-6 border-t border-slate-700/50 animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* MIDI */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-700/50 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">☀️ Midi</h3>
                <button
                  className="text-cyan-400 hover:text-cyan-300 font-bold text-sm bg-cyan-400/10 px-4 py-1.5 rounded-full transition-all border border-cyan-400/20"
                  onClick={() => setAddMidiOpen(!AddMidiOpen)}
                >
                  {AddMidiOpen ? "Fermer" : "+ Ajouter"}
                </button>
              </div>

              {AddMidiOpen && (
                <div className="mb-6 animate-slide-down flex gap-2">
                  <input
                    type="time"
                    autoFocus
                    className="flex-1 bg-slate-900 border border-cyan-500/50 rounded-xl p-3 text-white outline-none focus:ring-2 ring-cyan-500/20 text-lg"
                    value={tempMidiTranche}
                    onChange={(e) => setTempMidiTranche(e.target.value)}
                  />
                  <button
                    onClick={() => addTranche(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/10 font-bold"
                  >
                    OK
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {tranches.filter((tranche) => tranche.is_midi === 1).map((tranche, t_index) => (
                  <div key={t_index} className="flex items-center justify-between gap-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-600/50 rounded-xl px-4 py-2 transition-all min-w-[100px]">
                    <span className="font-mono font-bold text-lg">{tranche.tranche}</span>
                    <button
                      className="p-1 text-slate-500 hover:text-red-400 transition-all ml-2"
                      onClick={() => deleteTranche(tranche)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SOIR */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-700/50 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">🌙 Soir</h3>
                <button
                  className="text-cyan-400 hover:text-cyan-300 font-bold text-sm bg-cyan-400/10 px-4 py-1.5 rounded-full transition-all border border-cyan-400/20"
                  onClick={() => setAddSoirOpen(!AddSoirOpen)}
                >
                  {AddSoirOpen ? "Fermer" : "+ Ajouter"}
                </button>
              </div>

              {AddSoirOpen && (
                <div className="mb-6 animate-slide-down flex gap-2">
                  <input
                    type="time"
                    autoFocus
                    className="flex-1 bg-slate-900 border border-cyan-500/50 rounded-xl p-3 text-white outline-none focus:ring-2 ring-cyan-500/20 text-lg"
                    value={tempSoirTranche}
                    onChange={(e) => setTempSoirTranche(e.target.value)}
                  />
                  <button
                    onClick={() => addTranche(false)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/10 font-bold"
                  >
                    OK
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {tranches.filter((tranche) => tranche.is_midi === 0).map((tranche, t_index) => (
                  <div key={t_index} className="flex items-center justify-between gap-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-600/50 rounded-xl px-4 py-2 transition-all min-w-[100px]">
                    <span className="font-mono font-bold text-lg">{tranche.tranche}</span>
                    <button
                      className="p-1 text-slate-500 hover:text-red-400 transition-all ml-2"
                      onClick={() => deleteTranche(tranche)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Parametres;