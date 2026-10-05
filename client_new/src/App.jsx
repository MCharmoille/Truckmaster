import { useEffect, useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { Home, List, Plus, Settings, Utensils } from 'lucide-react'
import { logout, setUnauthorizedHandler } from './api.js'
import Connexion from './components/Connexion.jsx'

function SessionBridge({ setIsLoggedIn }) {
  const navigate = useNavigate()

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setIsLoggedIn(false)
      navigate('/')
    })
    return () => setUnauthorizedHandler(() => {})
  }, [navigate, setIsLoggedIn])

  return null
}

function EcranVide({ titre }) {
  return (
    <div className="flex min-h-full items-center justify-center">
      <h1 className="text-3xl font-bold">{titre}</h1>
    </div>
  )
}

function Parametres() {
  return (
    <div className="w-full min-h-full p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50">
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <button
          type="button"
          onClick={logout}
          className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/50 px-6 py-2 rounded-xl transition-all duration-300 font-bold flex items-center gap-2"
        >
          <span>🚪</span> Déconnexion
        </button>
      </div>
    </div>
  )
}

function LienBarre({ to, label, icon: Icon, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-col items-center gap-2 transition-colors group ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`
      }
    >
      {({ isActive }) => (
        <>
          <div className={`p-3 rounded-2xl transition-colors ${isActive ? 'bg-slate-700' : 'group-hover:bg-slate-700'}`}>
            <Icon className={`w-8 h-8 transition-opacity ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
          </div>
          <span className="text-lg font-bold">{label}</span>
        </>
      )}
    </NavLink>
  )
}

function PagesConnectees() {
  return (
    <div className="flex-1 w-full h-full relative">
      <div className="absolute top-0 left-0 right-0 bottom-32 pb-24 overflow-y-auto p-4 md:p-4 custom-scrollbar">
        <Routes>
          <Route path="/" element={<EcranVide titre="Accueil" />} />
          <Route path="/commandes" element={<EcranVide titre="Commandes" />} />
          <Route path="/add" element={<EcranVide titre="Nouvelle commande" />} />
          <Route path="/add/:commandeId" element={<EcranVide titre="Nouvelle commande" />} />
          <Route path="/documents" element={<EcranVide titre="Documents" />} />
          <Route path="/resume" element={<EcranVide titre="Résumé" />} />
          <Route path="/statistiques" element={<EcranVide titre="Statistiques" />} />
          <Route path="/produits" element={<EcranVide titre="Carte" />} />
          <Route path="/produit/:id" element={<EcranVide titre="Produit" />} />
          <Route path="/achats" element={<EcranVide titre="Achats" />} />
          <Route path="/parametres" element={<Parametres />} />
        </Routes>
      </div>

      <nav className="fixed bottom-0 w-full h-32 bg-slate-800 border-t border-slate-700 flex justify-around items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
        <div className="flex gap-8 md:gap-20">
          <LienBarre to="/" label="Accueil" icon={Home} end />
          <LienBarre to="/commandes" label="Commandes" icon={List} />
        </div>

        <div className="relative -top-10">
          <NavLink to="/add" aria-label="Nouvelle commande">
            {({ isActive }) => (
              <div className={`w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/30 flex items-center justify-center transform transition-transform hover:scale-105 active:scale-95 border-[10px] border-slate-900 ${isActive ? 'ring-4 ring-white/70' : ''}`}>
                <Plus className="w-14 h-14 text-slate-900" strokeWidth={3} />
              </div>
            )}
          </NavLink>
        </div>

        <div className="flex gap-8 md:gap-20">
          <LienBarre to="/produits" label="Carte" icon={Utensils} />
          <LienBarre to="/parametres" label="Paramètres" icon={Settings} />
        </div>
      </nav>
    </div>
  )
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('authToken')))

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white font-sans overflow-hidden">
      <BrowserRouter>
        <SessionBridge setIsLoggedIn={setIsLoggedIn} />
        {isLoggedIn ? (
          <PagesConnectees />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900">
            <Connexion onLogin={() => setIsLoggedIn(true)} />
          </div>
        )}
      </BrowserRouter>
    </div>
  )
}
