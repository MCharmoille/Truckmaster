import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Ingredients = ({ isOpen, onClose, onAddIngredient }) => {
  const [ingredients, setIngredients] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [newIngredientName, setNewIngredientName] = useState('');

  useEffect(() => {
    const getIngredients = async () => {
      try {
        const res = await axios.get(process.env.REACT_APP_API_URL + 'ingredients');
        
        setIngredients(res.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des ingrédients:', err);
      }
    };
    getIngredients();
  }, []);

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.nom.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleCreateIngredient = () => {
    if (!newIngredientName.trim()) return;
    const newIngredient = { id: Date.now(), nom: newIngredientName };
    // to do : enregistremenent du nouvel ingrédient dans la bd
    onAddIngredient(newIngredient, 1);
    setNewIngredientName('');
    setSearchValue('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="ingr_overlay">
      <div className="ingr_content">
        <h3>Ajouter un ingrédient</h3>
        <input type="text" placeholder="Rechercher un ingrédient" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
        <ul className="ingr_list">
          {filteredIngredients.map((ingredient, index) => (
            <li key={index} className="ingr_item" onClick={() => { onAddIngredient(ingredient, 1); onClose(); }}>
              {ingredient.nom}
            </li>
          ))}
        </ul>
        <div className="ingr_new">
          <input type="text" placeholder="Nom du nouvel ingrédient" value={newIngredientName} onChange={(e) => setNewIngredientName(e.target.value)} />
          <button onClick={handleCreateIngredient} disabled> Bientôt ! </button>
        </div>
        <button className="ingr_close" onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>
  );
};

export default Ingredients;
