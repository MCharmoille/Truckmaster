import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Modal = ({ produit, onClose }) => {
  const [recette, setRecette] = useState([]);
  const [prix, setPrix] = useState(produit.prix);
  
  useEffect(() => {
    const get_recette = async () => {
      try {
        const res = await axios.get(process.env.REACT_APP_API_URL+'produits/recette?id_produit='+produit.id_produit);
        
        res.data.forEach((ingredient) => {
          // vérification que le produit était déjà modifié
          const modif = produit.modifications?produit.modifications.findIndex((i) => i.id_ingredient === ingredient.id_ingredient):-1;
          if(modif !== -1)
            ingredient.modificateur = produit.modifications[modif].modificateur;
          else
            ingredient.modificateur = 0;
        });
        setRecette(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    get_recette();
  }, [produit.id_produit, produit.modifications]);

  const modifier_recette = (id, action) => {
    const id_ingredient = recette.findIndex((p) => p.id_ingredient === id);
    
    const recette_clone = [...recette];
    recette_clone[id_ingredient].modificateur = Math.min(1, Math.max(-1, recette_clone[id_ingredient].modificateur+ action));
    setRecette(recette_clone);
  };

  const valider = () => {
    const modification = [];
    recette.forEach((ing) => {
      if(ing.modificateur !== 0)
        modification.push({id_ingredient: ing.id_ingredient, nom: ing.nom, modificateur: ing.modificateur});
    });
    onClose(modification, prix);
  };
  
  return (
    <div className="modal-overlay">
      <div className='modal-content'>
        <h2>Personnalisation {produit.nom}</h2>
        <div className='recette'>
          {recette.map((ingredient, index) => (
              <div key={index}> 
                <span className={`nom_ingredient modificateur_${ingredient.modificateur}`}>
                  {ingredient.modificateur === -1 ? "SANS " : ingredient.modificateur === 1 ? "SUPPLÉMENT " : ""}{ingredient.nom}
                </span>
                <span className='moins' onClick={() => modifier_recette(ingredient.id_ingredient, -1)}> - </span> 
                <span className='plus' onClick={() => modifier_recette(ingredient.id_ingredient, 1)}> + </span>
              </div>
          ))}
        </div>
        <div className='cst_prix' >
          Prix spécial : 
          <input type='number' name='libelle' placeholder={produit.prix} onChange={(e) => setPrix(e.target.value)} /> €
        </div>
        <button className='bt_custom' onClick={valider}>Fermer</button>
      </div>
    </div>
  );
};

export default Modal;