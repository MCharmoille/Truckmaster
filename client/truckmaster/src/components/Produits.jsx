import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Produits = () => {
  const [produits, setProduits] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getProduits = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}produits`);
        setProduits(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    getProduits();
  }, []);

  const changeDisplay = async (index) => {
    try {
      const produit = produits[index];
      if (!produit || produit.id_type === 3) return;

      await axios.post(`${process.env.REACT_APP_API_URL}produits/save/` + produit.id_produit, { display: produit.display === 1 ? 0 : 1 })
        .catch(error => {
          console.error('Erreur lors de la mise à jour:', error);
        });
  
      const newProduits = [...produits];
      newProduits[index] = {
        ...produit,
        display: produit.display === 1 ? 0 : 1, 
      };
  
      setProduits(newProduits);
    } catch (err) {
      console.log(err);
    }
  };
  

  return (
    <div className='prods-container'>  
      {produits.map((produit, p_index) => {
        const isDisplayOn = produit.display === 1;
  
        return (
          <div className={`prods_produit`} key={p_index}>
            <h2>{produit.nom}</h2>
            <div className='prods_options' display={produit.display}>
              <button className={isDisplayOn ? "prods_bt_show" : "prods_bt_hide"} onClick={() => changeDisplay(p_index)}> 
                <img src={require(`../img/${isDisplayOn ? "show" : "hide"}.png`)} alt="show" /> 
              </button>
              <button onClick={() => navigate(`/produit/${produit.id_produit}`)}> 
                <img src={require(`../img/edit.png`)} alt="edit" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Produits;