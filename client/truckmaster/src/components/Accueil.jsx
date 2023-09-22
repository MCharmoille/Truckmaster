import React from 'react';
import logo from '../img/tm_white.png';
import '../App.css';
import { Link } from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <div className="home">
        <img className='home_logo' src={logo} alt="Truckmaster Logo"/>
        
        <div className='home_boutons'>
          <Link to="/commandes"> <button className="home_bouton">Commandes</button> </Link>
          <Link to="/resume"> <button className="home_bouton">Résumé (BETA)</button> </Link>
          <Link to="/devis"> <button className="home_bouton">Devis (BETA)</button> </Link>
          <button className="home_bouton">Facture (TODO)</button>
          <button className="home_bouton">Bouton 5</button>
          <button className="home_bouton">Bouton 6</button>
        </div>
          
        <div className="home_credits">
          <p>Maxime Charmoille</p>
          <p>Truckmaster v1.1</p>
        </div>
      </div>
    </div>
  );
}

export default App;