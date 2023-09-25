import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import Calendrier from './Calendrier';

const Resume = () => {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchCommandesForDate = async () => {
      if (selectedDate) {
        try {
          const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
          
          const res = await axios.get(`${process.env.REACT_APP_API_URL}commandes/resume/${formattedDate}`);
          console.log(res.data);
          setData(res.data);
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
  
  return (
    <div>
        <Calendrier onDateChange={handleDateChange} />
        <div>
            <h2> Résumé des commandes du {moment(selectedDate).format('YYYY-MM-DD')}</h2>
            <div>
            {data.length !== 0 ? (
                <div>
                {data.type_produit.length !== 0 ? (
                    data.type_produit.map((tp, tp_index) => (
                      <div key={tp_index}>
                        <h3>{tp.qte} x {tp.nom}</h3>
                        <div>
                          {tp.produits.length !== 0 ? (
                              tp.produits.map((produit, p_index) => (
                                  <div key={p_index}>
                                      {produit.qte} x {produit.nom}
                                  </div>
                              ))
                          ) : null
                          }
                        </div>
                        
                      </div>
                    ))
                ) : null
                }
                <div> <hr/> </div>
                {data.paiements.length !== 0 ? (
                    data.paiements.map((p, p_index) => (
                        <div key={p_index}>
                            {p.nom} : {p.valeur} €
                        </div>
                    ))
                ) : null
                }
                </div>
            ) : null
            }
            
          </div>
        </div>
    </div>
  );
};

export default Resume;