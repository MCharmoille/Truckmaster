import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import Accueil from "./components/Accueil";
import Commandes from "./components/Commandes";
import Devis from "./components/Devis";
import NouvelleCommande from "./components/NouvelleCommande";
import Resume from "./components/Resume";
import PenseBete from "./components/PenseBete";
import Parametres from "./components/Parametres";
import Statistiques from "./components/Statistiques";
import Connexion from "./components/Connexion";
import Bus from "./components/Bus";
import "./style.css";
import home from './img/home.png';
import list from './img/list.png';
import plus from './img/plus.png';
import params from './img/parametres.png';

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
    <div className="App">
      <BrowserRouter>
        {isLoggedIn ? (
          <div>
            <div className="accueil">
              <Link to="/"> <img src={home} alt="home" className="header_icons" /> </Link>
              <Link to="/commandes"> <img src={list} alt="list" className="header_icons" /> </Link>
              <Link to="/add"> <img src={plus} alt="plus" className="header_icons" /> </Link>
              <Link to="/parametres"> <img src={params} alt="params" className="header_icons" style={{ float: "right", marginRight: "10px" }}/> </Link>
              <div className='acc_connecte'> {localStorage.getItem('user')} </div>
            </div>
            <div className="corps">
              <Routes>
                <Route path="/" element={<Accueil/>}/>
                <Route path="/commandes" element={<Commandes/>}/>
                <Route path="/add" element={<NouvelleCommande />} />
                <Route path="/add/:commandeId" element={<NouvelleCommande />} />
                <Route path="/devis" element={<Devis/>}/>
                <Route path="/resume" element={<Resume/>}/>
                <Route path="/statistiques" element={<Statistiques/>}/>
                <Route path="/pensebete" element={<PenseBete/>}/>
                <Route path="/parametres" element={<Parametres isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>}/>
                <Route path="/bus" element={<Bus/>}/>
              </Routes>
            </div>
          </div>
        ) : (
          <div>
            <div className="accueil"></div>
            <Connexion onLogin={() => setIsLoggedIn(true)} />
          </div>
        )}
      </BrowserRouter>
    </div>
  );
}

export default App;
