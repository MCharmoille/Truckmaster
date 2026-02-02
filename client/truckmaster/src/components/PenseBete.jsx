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

  const checkIngredient = async (id_ingredient, isChecked) => {
    setCheckedValues(prevCheckedValues => ({
      ...prevCheckedValues,
      [id_ingredient]: isChecked
    }));
    const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
    try {
      await axios.post(process.env.REACT_APP_API_URL + "produits/ingredients/check/", { date: formattedDate, id: id_ingredient, checked: isChecked });
    } catch (error) {
      console.error("Une erreur s'est produite lors de la requête POST :", error);
    }
  }

  const changeStock = async (id_ingredient, newStock) => {
    setStockValues(prevStockValues => ({
      ...prevStockValues,
      [id_ingredient]: newStock
    }));
    const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
    try {
      await axios.post(process.env.REACT_APP_API_URL + "produits/ingredients/stock/", { date: formattedDate, id: id_ingredient, stock: newStock });
    } catch (error) {
      console.error("Une erreur s'est produite lors de la requête POST :", error);
    }
  }

  return (
    <div>
      <Calendrier onDateChange={handleDateChange} />
      <div className="max-w-4xl mx-auto p-4">
        {ingredients.length !== 0 ? (
          <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl space-y-4">
            {ingredients.map((ing, i_index) => (
              <div key={i_index} className="flex items-center gap-4 text-xl text-slate-200">
                <input
                  type="checkbox"
                  className="w-6 h-6 rounded-lg bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500/20 transition-all"
                  checked={checkedValues[ing.id_ingredient] || 0}
                  onChange={(event) => checkIngredient(ing.id_ingredient, event.target.checked)}
                />
                <span className="flex-1 font-medium">{ing.nom}</span>
                {ing.gestion_stock ? (
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">:</span>
                    <input
                      type="number"
                      className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 outline-none transition-all"
                      value={stockValues[ing.id_ingredient] || ""}
                      onChange={(event) => changeStock(ing.id_ingredient, event.target.value)}
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PenseBete;