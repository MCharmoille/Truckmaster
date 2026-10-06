import { NavLink, useSearchParams } from 'react-router-dom'
import { useSyncExternalStore } from 'react'
import { Home, List, Plus, Settings, Utensils } from 'lucide-react'
import { lireJour, periodesFermees, souscrirePeriodes } from '../date.js'

const PASTILLE = 'w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/30 flex items-center justify-center border-[10px] border-slate-900'

function Lien({ to, label, icon: Icon, end = false }) {
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

function LienNouvelleCommande({ fermees }) {
  const [params] = useSearchParams()
  const date = params.get('date') || lireJour()

  if (fermees) {
    return (
      <button type="button" aria-label="Nouvelle commande" disabled className={`${PASTILLE} opacity-40 cursor-not-allowed`}>
        <Plus className="w-14 h-14 text-slate-900" strokeWidth={3} />
      </button>
    )
  }

  return (
    <NavLink to={date ? `/add?date=${date}` : '/add'} aria-label="Nouvelle commande">
      {({ isActive }) => (
        <div className={`${PASTILLE} transform transition-transform hover:scale-105 active:scale-95 ${isActive ? 'ring-4 ring-white/70' : ''}`}>
          <Plus className="w-14 h-14 text-slate-900" strokeWidth={3} />
        </div>
      )}
    </NavLink>
  )
}

export default function Barre() {
  const fermees = useSyncExternalStore(souscrirePeriodes, periodesFermees, () => false)

  return (
    <>
      {fermees && (
        <p className="fixed bottom-48 left-0 right-0 z-50 px-4 text-center text-lg font-bold text-amber-300">
          Activez le midi ou le soir pour prendre une commande.
        </p>
      )}

      <nav className="fixed bottom-0 w-full h-32 bg-slate-800 border-t border-slate-700 flex justify-around items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
        <div className="flex gap-8 md:gap-20">
          <Lien to="/" label="Accueil" icon={Home} end />
          <Lien to="/commandes" label="Commandes" icon={List} />
        </div>

        <div className="relative -top-10">
          <LienNouvelleCommande fermees={fermees} />
        </div>

        <div className="flex gap-8 md:gap-20">
          <Lien to="/produits" label="Carte" icon={Utensils} />
          <Lien to="/parametres" label="Paramètres" icon={Settings} />
        </div>
      </nav>
    </>
  )
}
