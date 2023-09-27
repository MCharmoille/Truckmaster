import React from 'react';

const Confirm = ({ message, onClose }) => {
  return (
    <div className="confirm-overlay">
      <div className='confirm-content'>
        <div className='confirm-text'>{message}</div>
        <button className='confirm-valider' onClick={() => onClose(true)}>Valider</button>
        <button className='confirm-annuler' onClick={() => onClose(false)}>Annuler</button>
      </div>
    </div>
  );
};

export default Confirm;