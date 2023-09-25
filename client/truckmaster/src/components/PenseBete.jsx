import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import Calendrier from './Calendrier';

const PenseBete = () => {
  const [ingredients, setIngredients] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [checkedValues, setCheckedValues] = useState({});
  const [stockValues, setStockValues] = useState({});

  useEffect(() => {
    const fetchCommandesForDate = async () => {
      if (selectedDate) {
        try {
          const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
          
          const res = await axios.get(`${process.env.REACT_APP_API_URL}produits/ingredients/${formattedDate}`);
          console.log(res.data);
          setIngredients(res.data);

          const initialStockValues = {};
          const initialCheckedValues = {};
          res.data.forEach(ing => {
            initialStockValues[ing.id_ingredient] = ing.stock || "";
            initialCheckedValues[ing.id_ingredient] = ing.checked || 0;
          });
          setStockValues(initialStockValues);
          setCheckedValues(initialCheckedValues);
        } catch (err) {
          console.log(err);
        }
      }
    };
    fetchCommandesForDate();
  }, [selectedDate]);
  
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const checkIngredient = async(id_ingredient, isChecked) => {
    setCheckedValues(prevCheckedValues => ({
      ...prevCheckedValues,
      [id_ingredient]: isChecked
    }));
    const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
    try {
        await axios.post(process.env.REACT_APP_API_URL+"produits/ingredients/check/", {date: formattedDate, id: id_ingredient, checked : isChecked});
    } catch (error) {
        console.error("Une erreur s'est produite lors de la requête POST :", error);
    }
  }

  const changeStock = async(id_ingredient, newStock) => {
    setStockValues(prevStockValues => ({
      ...prevStockValues,
      [id_ingredient]: newStock
    }));
    const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
    try {
        await axios.post(process.env.REACT_APP_API_URL+"produits/ingredients/stock/", {date: formattedDate, id: id_ingredient, stock : newStock});
    } catch (error) {
        console.error("Une erreur s'est produite lors de la requête POST :", error);
    }
  }
  
  return (
    <div style={{height: "100vh"}}>
        <Calendrier onDateChange={handleDateChange} />
        <div>
            {ingredients.length !== 0 ? (
                <div className='pense_bete'>
                {ingredients.map((ing, i_index) => (
                  <div key={i_index}>
                    <input type="checkbox" checked={checkedValues[ing.id_ingredient] || 0} onChange={(event) => checkIngredient(ing.id_ingredient, event.target.checked)}/> {ing.nom}
                    {ing.gestion_stock ? (
                      <span>
                        :{" "}
                        <input
                          type="number"
                          value={stockValues[ing.id_ingredient] || ""}
                          onChange={(event) => changeStock(ing.id_ingredient, event.target.value)}
                        />{" "}
                      </span>
                    ) : (
                      ""
                    )}
                  </div>
                ))
                }
                </div>
            ) : null
            }
        </div>
    </div>
  );
};

export default PenseBete;