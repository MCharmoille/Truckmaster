import React from 'react';

const ModalBoissons = ({ onClose }) => {

  const valider = (id) => {
    onClose(id);
  };
  
  return (
    <div className="modal-overlay">
      <div className='modal-content' style={{width: "400px"}}>
        <button className='bt_boisson' onClick={() => valider(10)} style={{backgroundColor: "#fe001a"}}>Coca</button>
        <button className='bt_boisson' onClick={() => valider(11)} style={{backgroundColor: "#edd72c"}}>Orangina</button>
        <button className='bt_boisson' onClick={() => valider(12)} style={{backgroundColor: "#ebd65f"}}>Schweppes</button>
        <button className='bt_boisson' onClick={() => valider(13)} style={{backgroundColor: "#923c01"}}>Ice Tea</button>
        <button className='bt_boisson' onClick={() => valider(14)} style={{backgroundColor: "#21337b", color: "white"}}>Caprisun</button>
        <button className='bt_boisson' onClick={() => valider(15)} style={{backgroundColor: "#fce187"}}>Bière (2€)</button>
        <button className='bt_boisson' onClick={() => valider(16)} style={{backgroundColor: "#e67929"}}>Bière locale (3.5€)</button>
        <button className='bt_annuler' onClick={() => valider(0)}>Annuler</button>
      </div>
    </div>
  );
};

export default ModalBoissons;