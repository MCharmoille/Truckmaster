import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { setUnauthorizedHandler } from './api.js'
import Barre from './components/Barre.jsx'
import Commandes from './components/Commandes.jsx'
import Connexion from './components/Connexion.jsx'
import NouvelleCommande from './components/NouvelleCommande.jsx'
import Parametres from './components/Parametres.jsx'

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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('authToken')))

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white font-sans overflow-hidden">
      <BrowserRouter>
        <SessionBridge setIsLoggedIn={setIsLoggedIn} />
        {isLoggedIn ? (
          <div className="flex-1 w-full h-full relative">
            <div className="absolute top-0 left-0 right-0 bottom-32 pb-24 overflow-y-auto p-4 md:p-4 custom-scrollbar">
              <Routes>
                <Route path="/" element={<EcranVide titre="Accueil" />} />
                <Route path="/commandes" element={<Commandes />} />
                <Route path="/add" element={<NouvelleCommande />} />
                <Route path="/add/:commandeId" element={<NouvelleCommande />} />
                <Route path="/documents" element={<EcranVide titre="Documents" />} />
                <Route path="/resume" element={<EcranVide titre="Résumé" />} />
                <Route path="/statistiques" element={<EcranVide titre="Statistiques" />} />
                <Route path="/produits" element={<EcranVide titre="Carte" />} />
                <Route path="/produit/:id" element={<EcranVide titre="Produit" />} />
                <Route path="/achats" element={<EcranVide titre="Achats" />} />
                <Route path="/parametres" element={<Parametres />} />
              </Routes>
            </div>

            <Barre />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900">
            <Connexion onLogin={() => setIsLoggedIn(true)} />
          </div>
        )}
      </BrowserRouter>
    </div>
  )
}
