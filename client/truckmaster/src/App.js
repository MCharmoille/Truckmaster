import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import Accueil from "./components/Accueil";
import Commandes from "./components/Commandes";
import Documents from "./components/Documents";
import NouvelleCommande from "./components/NouvelleCommande";
import Resume from "./components/Resume";
import Parametres from "./components/Parametres";
import Statistiques from "./components/Statistiques";
import Connexion from "./components/Connexion";
import Produits from "./components/Produits";
import Produit from "./components/Produit";
import Achats from "./components/Achats";
import { Home, List, Plus, Utensils, Settings } from 'lucide-react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    // TO DO : protéger toutes les requêtes http axios en vérifiant et incluant le token
    if (storedToken) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white font-sans overflow-hidden">
      <BrowserRouter>
        {isLoggedIn ? (
          <div className="flex-1 w-full h-full relative">

            {/* Main Content Area - Scrollable */}
            <div className="absolute top-0 left-0 right-0 bottom-32 pb-24 overflow-y-auto p-4 md:p-4 custom-scrollbar">
              <Routes>
                <Route path="/" element={<Accueil />} />
                <Route path="/commandes" element={<Commandes />} />
                <Route path="/add" element={<NouvelleCommande />} />
                <Route path="/add/:commandeId" element={<NouvelleCommande />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/resume" element={<Resume />} />
                <Route path="/statistiques" element={<Statistiques />} />
                <Route path="/produits" element={<Produits />} />
                <Route path="/produit/:id" element={<Produit />} />
                <Route path="/achats" element={<Achats />} />
                <Route path="/parametres" element={<Parametres isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
              </Routes>
            </div>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 w-full h-32 bg-slate-800 border-t border-slate-700 flex justify-around items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">

              {/* Left Group */}
              <div className="flex gap-8 md:gap-20">
                <Link to="/" className="flex flex-col items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                  <div className="p-3 rounded-2xl group-hover:bg-slate-700 transition-colors">
                    <Home className="w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-lg font-bold">Accueil</span>
                </Link>

                <Link to="/commandes" className="flex flex-col items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                  <div className="p-3 rounded-2xl group-hover:bg-slate-700 transition-colors">
                    <List className="w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-lg font-bold">Commandes</span>
                </Link>
              </div>

              {/* Central Floating Button - NEW ORDER */}
              <div className="relative -top-10">
                <Link to="/add">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/30 flex items-center justify-center transform transition-transform hover:scale-105 active:scale-95 border-[10px] border-slate-900">
                    <Plus className="w-14 h-14 text-slate-900" strokeWidth={3} />
                  </div>
                </Link>
              </div>

              {/* Right Group */}
              <div className="flex gap-8 md:gap-20">
                <Link to="/produits" className="flex flex-col items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                  <div className="p-3 rounded-2xl group-hover:bg-slate-700 transition-colors">
                    <Utensils className="w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-lg font-bold">Carte</span>
                </Link>

                <Link to="/parametres" className="flex flex-col items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                  <div className="p-3 rounded-2xl group-hover:bg-slate-700 transition-colors">
                    <Settings className="w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-lg font-bold">Paramètres</span>
                </Link>
              </div>

            </nav>

          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900">
            <Connexion onLogin={() => setIsLoggedIn(true)} />
          </div>
        )}
      </BrowserRouter>
    </div>
  );
}

export default App;
