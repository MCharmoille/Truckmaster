import React, { useEffect, useState } from 'react';
import axios from 'axios';
import reload from '../../img/reload.png';
import CustomSauce from "./CustomSauce";

const Modal = ({ produit, onClose }) => {
  const [recette, setRecette] = useState([]);
  const [prix, setPrix] = useState(produit.prix);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [showCustomSauce, setCustomSauce] = useState(false);
  
  useEffect(() => {
    const getProduit = async () => {
      try {
        const res = await axios.get(process.env.REACT_APP_API_URL+'produits/produit?id_produit='+produit.id_produit);
        
        res.data.recette.forEach((ingredient) => {
          // vérification que le produit était déjà modifié
          const modif = produit.modifications?produit.modifications.findIndex((i) => i.id_ingredient === ingredient.id_ingredient):-1;
          if(modif !== -1)
            ingredient.modificateur = produit.modifications[modif].modificateur;
          else
            ingredient.modificateur = 0;
        });
        setRecette(res.data.recette);
      } catch (err) {
        console.log(err);
      }
    };
    getProduit();
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

  const CloseCustomSauce = (new_id, new_nom) => {
    setCustomSauce(false);

    const recette_clone = [...recette];
    recette_clone[recette.findIndex((p) => p.id_ingredient === selectedIngredient)].nom = new_nom;
    recette_clone[recette.findIndex((p) => p.id_ingredient === selectedIngredient)].modificateur = 2;
    recette_clone[recette.findIndex((p) => p.id_ingredient === selectedIngredient)].id_ingredient = new_id;
    setRecette(recette_clone);
  };
  
  return (
    <div className="cusprod_overlay">
      <div className='cusprod_content'>
        <h2>Personnalisation {produit.nom}</h2>
        <div className='cusprod_recette'>
          {recette.map((ingredient, index) => (
              <div key={index}> 
                <span className={`cusprod_nom_ingredient glo_modificateur_${ingredient.modificateur}`}>
                  {ingredient.modificateur === -1 ? "SANS " : ingredient.modificateur === 1 ? "SUPPLÉMENT " : ""}{ingredient.nom}
                  {ingredient.gestion_sauce === 1 ? <img src={reload} alt="reload" className='cusprod_changeSauce' onClick={() => {setSelectedIngredient(ingredient.id_ingredient); setCustomSauce(true);}} /> : null}
                </span>
                <span className='cusprod_moins' onClick={() => modifier_recette(ingredient.id_ingredient, -1)}> - </span> 
                <span className='cusprod_plus' onClick={() => modifier_recette(ingredient.id_ingredient, 1)}> + </span>
              </div>
          ))}
        </div>
        <div className='cusprod_prix' >
          Prix spécial : 
          <input type='number' name='libelle' placeholder={produit.prix} onChange={(e) => setPrix(e.target.value)} /> €
        </div>
        <button className='cusprod_close' onClick={valider}>Fermer</button>
      </div>
      {showCustomSauce && (
          <CustomSauce onClose={CloseCustomSauce} />
      )}
    </div>
  );
};

export default Modal;