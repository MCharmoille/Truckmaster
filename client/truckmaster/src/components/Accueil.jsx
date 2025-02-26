import React from 'react';
import logo from '../img/tm_white.png';
import { Link } from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <div className="home">
        <img className='home_logo' src={logo} alt="Truckmaster Logo"/>
        
        <div className='home_boutons'>
          <Link to="/pensebete"> <button className="home_bouton">Pense-bête</button> </Link>
          <Link to="/commandes"> <button className="home_bouton">Commandes</button> </Link>
          <Link to="/resume"> <button className="home_bouton">Résumé</button> </Link>
          <Link to="/produits"> <button className="home_bouton">Ma carte</button> </Link>
          <Link> <button className="home_bouton">Devis <i>(Bientôt !)</i></button> </Link>
          <button className="home_bouton"><i>(Bientôt !)</i></button>
        </div>
          
        <div className="home_credits">
          <p>Maxime Charmoille</p>
          <p>Truckmaster v1.5</p>
        </div>
      </div>
    </div>
  );
}

export default App;