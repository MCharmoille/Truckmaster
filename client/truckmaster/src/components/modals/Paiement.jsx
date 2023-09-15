import React from 'react';
import axios from 'axios';

const Modal = ({ commande, onClose }) => {
  
    const valider = async (moyen_paiement) => {
        if(moyen_paiement !== 0){
            try {
              await axios.post("https://truckmaster.ovh:8800/commandes/paiement", {id_commande : commande.id_commande, moyen_paiement : moyen_paiement});
            } catch (error) {
              console.error("Une erreur s'est produite lors de la requête POST :", error);
            }
        }
        onClose(moyen_paiement);
    };

  return (
    <div className="modal-overlay">
      <div className='modal-content'>
        <h2>Paiement {commande.libelle} : {commande.total} €</h2>
        <button className='bt_paiement' onClick={() => valider("c")}>Carte</button>
        <button className='bt_paiement' onClick={() => valider("m")}>Monnaie</button>
        <button className='bt_paiement' onClick={() => valider("h")}>Cheque</button>
        <button className='bt_paiement' onClick={() => valider(0)}>Annuler</button>
      </div>
    </div>
  );
};

export default Modal;