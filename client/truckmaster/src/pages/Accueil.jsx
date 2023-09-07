import React from 'react';
import logo from '../logo.svg';
import '../App.css';
import { Link } from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <img src={logo} alt="Truckmaster Logo" style={{ width: '200px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
        <Link to="/commandes"> <button style={{ margin: '10px', padding: '10px 20px' }}>Commandes</button> </Link>
        <Link to="/devis"> <button style={{ margin: '10px', padding: '10px 20px' }}>Devis</button> </Link>
        <button style={{ margin: '10px', padding: '10px 20px' }}>Facture</button>
      </div>
    </div>
  );
}

export default App;