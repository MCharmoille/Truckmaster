import { logout } from '../api.js'

export default function Parametres() {
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
