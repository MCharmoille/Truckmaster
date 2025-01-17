import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import Calendrier from './Calendrier';
import { Link } from 'react-router-dom'

const Resume = () => {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchCommandesForDate = async () => {
      if (selectedDate) {
        try {
          const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
          
          const res = await axios.get(`${process.env.REACT_APP_API_URL}commandes/resume/${formattedDate}`);
          setData(res.data);
        } catch (err) {
          console.log(err);
        }
      }
    };
    fetchCommandesForDate();
  }, [selectedDate]);
  
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate.jour);
  };
  
  return (
    <div>
      <Calendrier onDateChange={handleDateChange} />
      {data.length !== 0 ? (
        <div>
          <div className='res_tps'>
            {data.type_produit.map((tp, tp_index) => (
              <div className='res_tp' key={tp_index}>
                <img className='res_icone' src={require(`../img/type_produit/${tp.id_type}.png`)} alt={tp.nom} />
                  {tp.qte !== 0 && tp.id_type !== 4 ? <h3>{tp.qte} x {tp.nom}</h3> : ""}
                  {tp.produits.length !== 0 ? (
                    tp.produits.map((produit, pr_index) => (
                      <div key={pr_index}>{produit.qte} x {produit.nom}</div>
                    ))
                  ) : null}
              </div>
            ))}
          </div>

          <div className='res_paiements'>
            <img className='res_icone_paiement' src={require(`../img/paiement.png`)} alt="paiement" />
            <div style={{lineHeight: "35px",marginLeft: "175px"}}>
              {data.paiements.map((p, p_index) => (
                <div key={p_index}>
                  {p.nom} : {p.valeur} €
                </div>
              ))}
            </div>
          </div>

          <div className='res_stats'>
            <Link to="/statistiques"> <img style={{"width":"100%"}} src={require(`../img/stats.png`)} alt="stats" /> </Link>
          </div>
        </div>
      ) : null}
    </div>
  );  
};

export default Resume;