import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Ingredients from "./modals/Ingredients";// Import du modal

const Produit = () => {
  const { id } = useParams();
  const [produit, setProduit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const getProduit = async () => {
      try {
        const res = await axios.get(process.env.REACT_APP_API_URL + 'produits/produit?id_produit=' + id);
        setProduit(res.data);
      } catch (err) {
        console.error('Erreur lors de la récupération du produit:', err);
      }
    };

    getProduit();
  }, [id]);

  const handleAddIngredient = async (ingredient, action) => {
    var exists = produit.recette.findIndex((p) => (p.id_ingredient === ingredient.id_ingredient));

    if ((exists === -1 && action === 1) || (exists !== -1 && action === -1)) {
        try {
            let clonedProduit = { ...produit };

            if (action === 1) { // ajout d'un ingrédient
                clonedProduit.recette = [
                    ...clonedProduit.recette,
                    { id_produit: produit.id_produit, id_ingredient: ingredient.id_ingredient, nom: ingredient.nom, qte: null },
                ];
            } else if (action === -1 && exists !== -1) { // retrait d'un ingrédient
                clonedProduit.recette = clonedProduit.recette.filter(p => p.id_ingredient !== ingredient.id_ingredient);
            }

            axios.post(`${process.env.REACT_APP_API_URL}produits/save/` + clonedProduit.id_produit, clonedProduit)
                    .catch(error => {
                        console.error('Erreur lors de la mise à jour:', error);
                    });

            setProduit(clonedProduit);

          } catch (err) {
            console.error('Erreur lors de la récupération du produit:', err);
          }
    }
    else {
        alert("Cet ingrédient est déjà dans la recette !");
    }
  };

  if (!produit) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="prod_container">
      <section className="prod_info">
        <button className="prod_retour" onClick={() => window.history.back()}>
          Retour
        </button>
        <h1>{produit.nom}</h1>
        <div className="prod_prix">
            <span>Prix :</span>
            <strong>{produit.prix_produit} €</strong>
        </div>
      </section>

      <section className="prod_recette">
        <h2>Recette</h2>
        <ul>
          {produit.recette.map((ingredient, index) => (
            <li key={index} className="prod_ingredient">
              <div className="prod_drag">
                <img src={require('../img/drag.png')} alt="Glisser pour réorganiser" title="Glisser pour réorganiser" width="24px" />
              </div>
              <div className="prod_ingredient_qte">{ingredient.qte > 0 ? `${ingredient.qte}` : ''}</div>
              <div className="prod_ingredient_nom">{ingredient.nom}</div>
              <button className="prod_ingredient_delete" onClick={() => handleAddIngredient({id_ingredient: ingredient.id_ingredient}, -1)}>Supprimer</button>
            </li>
          ))}
          <li className="prod_ingredient_new">
            <button onClick={() => setIsModalOpen(true)}>Ajouter un ingrédient</button>
          </li>
        </ul>
      </section>

      <section className="prod_stat">
        <h2>Statistiques de vente</h2>
        <div className="prod_graph_placeholder">
          <p>Graphique des ventes bientôt ici</p>
        </div>
      </section>

      <Ingredients isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddIngredient={handleAddIngredient} />
    </div>
  );
};

export default Produit;
