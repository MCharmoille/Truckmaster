import React from 'react';
import logo from '../img/tm_white.png';
import { Link } from 'react-router-dom'

function App() {
  return (
    <div className="w-full h-full">
      <div className="max-w-6xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 animate-fade-in-down">
          <div className="flex items-center gap-6">
            <img className='w-28 h-auto drop-shadow-lg' src={logo} alt="Truckmaster Logo" />
            <div>
              <h2 className="text-4xl font-bold text-white">Bonjour !</h2>
              <p className="text-slate-400 text-lg">Prêt pour le service ?</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 text-right hidden md:block">
            <p className="text-emerald-400 font-bold text-xl">V1.5.0</p>
            <p className="text-slate-500 text-base">Dernière MàJ : Janvier 2026</p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24'>

          <Link to="/add">
            <div className="group bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-lg hover:shadow-emerald-500/10">
              <div className="h-14 w-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Nouvelle Commande</h3>
              <p className="text-slate-400 text-lg">Saisir une commande pour un client en direct.</p>
            </div>
          </Link>

          <Link to="/commandes">
            <div className="group bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-lg hover:shadow-blue-500/10">
              <div className="h-14 w-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Commandes</h3>
              <p className="text-slate-400 text-lg">Voir la liste des commandes en cours et passées.</p>
            </div>
          </Link>

          <Link to="/pensebete">
            <div className="group bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-yellow-500/50 hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-lg hover:shadow-yellow-500/10">
              <div className="h-14 w-14 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Pense-bête</h3>
              <p className="text-slate-400 text-lg">Notes rapides et liste de courses.</p>
            </div>
          </Link>

          <Link to="/resume">
            <div className="group bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-purple-500/50 hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-lg hover:shadow-purple-500/10">
              <div className="h-14 w-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Résumé</h3>
              <p className="text-slate-400 text-lg">Totaux de la journée et chiffre d'affaires.</p>
            </div>
          </Link>

          <Link to="/produits">
            <div className="group bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-pink-500/50 hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-lg hover:shadow-pink-500/10">
              <div className="h-14 w-14 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🍔</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Ma Carte</h3>
              <p className="text-slate-400 text-lg">Gérer les produits, prix et ingrédients.</p>
            </div>
          </Link>


          <Link to="/statistiques">
            <div className="group bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-lg hover:shadow-cyan-500/10">
              <div className="h-14 w-14 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">📈</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Statistiques</h3>
              <p className="text-slate-400 text-lg">Graphiques et analyses détaillées.</p>
            </div>
          </Link>

          {/* Coming Soon Card */}
          <div className="opacity-50 grayscale cursor-not-allowed bg-slate-800 p-8 rounded-2xl border border-slate-700">
            <div className="h-14 w-14 bg-slate-500/20 rounded-xl flex items-center justify-center mb-4">
              <span className="text-3xl">🔨</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-400 mb-2">Devis</h3>
            <p className="text-slate-500 text-lg">Fonctionnalité bientôt disponible.</p>
          </div>

        </div>

        <div className="mt-12 text-center text-slate-600 text-base">
          <p>Développé avec ❤️ par Maxime Charmoille</p>
        </div>
      </div>
    </div>
  );
}

export default App;