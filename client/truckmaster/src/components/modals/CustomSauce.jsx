import React from 'react';

const CustomSauce = ({ onClose }) => {

  const valider = (id, nom) => {
    onClose(id, nom);
  };
  
  return (
    <div className="modal-overlay">
      <div className='modal-content' style={{width: "400px"}}>
        <button className='bt_sauce' onClick={() => valider(11, "Ketchup")} style={{backgroundColor: "#a82d1f", color: "white"}}>Ketchup</button>
        <button className='bt_sauce' onClick={() => valider(21, "Mayonnaise")} style={{backgroundColor: "#fcf7e2"}}>Mayonnaise</button>
        <button className='bt_sauce' onClick={() => valider(12, "Moutarde")} style={{backgroundColor: "#ebd65f"}}>Moutarde</button>
        <button className='bt_sauce' onClick={() => valider(22, "Samouraï")} style={{backgroundColor: "orange"}}>Samouraï</button>
        <button className='bt_sauce' onClick={() => valider(35, "Sauce blanche")} style={{backgroundColor: "#f5f5f5"}}>Blanche</button>
        <button className='bt_sauce' onClick={() => valider(36, "Moutarde à l'ancienne")} style={{backgroundColor: "#d1b16f"}}>Mout. à l'ancienne</button>
        <button className='bt_sauce' onClick={() => valider(37, "Sauce algérienne")} style={{backgroundColor: "#b5651d"}}>Algérienne</button>
        <button className='bt_sauce' onClick={() => valider(38, "Sauce barbecue")} style={{backgroundColor: "#4b2e1a", color: "white"}}>Barbecue</button>
        <button className='bt_sauce' onClick={() => valider(42, "Sauce burger")} style={{backgroundColor: "#c85019"}}>Burger</button>
        <br/>
        <button className='bt_annuler' onClick={() => valider(0)}>Annuler</button>
      </div>
    </div>
  );
};

export default CustomSauce;