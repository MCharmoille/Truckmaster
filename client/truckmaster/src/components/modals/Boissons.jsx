import React from 'react';

const ModalBoissons = ({ onClose }) => {

  const valider = (id) => {
    onClose(id);
  };
  
  return (
    <div className="modal-overlay">
      <div className='modal-content'>
        <button className='bt_paiement' onClick={() => valider(10)}>Coca</button>
        <button className='bt_paiement' onClick={() => valider(11)}>Fanta</button>
        <button className='bt_paiement' onClick={() => valider(12)}>Sprite</button>
        <button className='bt_paiement' onClick={() => valider(13)}>Ice Tea</button>
        <button className='bt_paiement' onClick={() => valider(14)}>Caprisun</button>
        <button className='bt_paiement' onClick={() => valider(15)}>Bière (2€)</button>
        <button className='bt_paiement' onClick={() => valider(16)}>Bière locale (3€)</button>
      </div>
    </div>
  );
};

export default ModalBoissons;