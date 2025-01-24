import React from 'react';
import axios from 'axios';

const Modal = ({ commande, onClose }) => {
  
    const valider = async (moyen_paiement) => {
        if(moyen_paiement !== 0){
            try {
              await axios.post(process.env.REACT_APP_API_URL+"commandes/paiement", {id_commande : commande.id_commande, moyen_paiement : moyen_paiement});
            } catch (error) {
              console.error("Une erreur s'est produite lors de la requête POST :", error);
            }
        }
        onClose(moyen_paiement);
    };

  return (
    <div className="pai_overlay">
      <div className='pai_content'>
        <h2>Paiement {commande.libelle} : {commande.total} €</h2>
        <button onClick={() => valider("c")}>Carte</button>
        <button onClick={() => valider("m")}>Monnaie</button>
        <button onClick={() => valider("h")}>Chèque</button>
        <button onClick={() => valider("o")}>Offert</button>
        <button onClick={() => valider(0)}>Annuler</button>
      </div>
    </div>
  );
};

export default Modal;