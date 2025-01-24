import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import Modal from "./modals/Paiement";
import Calendrier from './Calendrier';
import { useNavigate } from 'react-router-dom';

const Commandes = () => {
  const [commandes, setCommandes] = useState([]);
  const [tranches, setTranches] = useState([]);
  const [selectedDate, setSelectedDate] = useState({jour: null, cb_midi: true, cb_soir: true});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommandesForDate = async () => {
      if (selectedDate.jour !== null) {
        try {
          const formattedDate = moment(selectedDate.jour).format('YYYY-MM-DD');
          
          const res = await axios.get(`${process.env.REACT_APP_API_URL}commandes/date/${formattedDate}`);
          setCommandes(res.data);

          const new_tranches = [];
          res.data.forEach((commande) => {
            const timeCommande = moment(commande.date_commande).format('HH:mm');
        
            const foundTranche = new_tranches.find((tranche) => tranche.time === timeCommande);
        
            if (foundTranche) {
              foundTranche.content.push(commande);
            } else {
              new_tranches.push({time : timeCommande, type : timeCommande.substring(0, 2) < 16 ? 1 : 2, content : [commande]});
            }
          });
          
          setTranches(new_tranches);
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

  const [showModal, setShowModal] = useState(false);
  const [selectedCommande, setselectedCommande] = useState(null);

  const handleCloseModal = (moyen_paiement) => {
      setShowModal(false);

      if(moyen_paiement !== 0){
        const id_c = commandes.findIndex((c) => (c.id_commande === selectedCommande.id_commande));

        if (id_c !== -1) {
            const c_clone = [...commandes];
            c_clone[id_c].moyen_paiement = moyen_paiement;
            setCommandes(c_clone);
        }
      }
  };

  const paiement_commande = (commande) => {
    setselectedCommande(commande);
    setShowModal(true);
  };

  const checkCb = async (event) => {
      setSelectedDate({ ...selectedDate, [event.target.name]: event.target.checked })

      try {
        await axios.post(process.env.REACT_APP_API_URL+"dates/updateCb", {id_date : selectedDate.id_date, cb : [event.target.name], checked : event.target.checked});
      } catch (error) {
        console.error("Une erreur s'est produite lors de la requête POST :", error);
      }
  };
  
  return (
    <div>
      <Calendrier onDateChange={handleDateChange} />
      <div className='coms_filtres'>
        <input type="checkbox" id="cb_midi" name="cb_midi" checked={selectedDate.cb_midi} onChange={(e) => checkCb(e)}/> Midi 
        <input type="checkbox" id="cb_soir" name="cb_soir" checked={selectedDate.cb_soir} onChange={(e) => checkCb(e)}/> Soir
      </div>
      {tranches.map((tranche, t_index) => (
        <div className={"coms_tranche" + (tranche.type === 1 ? (!selectedDate.cb_midi ? " hidden" : "") : (!selectedDate.cb_soir ? " hidden" : ""))} key={t_index}>
          <h2>{tranche.time}</h2>
          <div className="coms_container">
            {tranche.content.length !== 0 ? (
              tranche.content.map((commande, c_index) => (
                <div className={`coms_commande ${commande.moyen_paiement !== null ? 'coms_paye' : ''}`} key={c_index} onClick={() => navigate("/add/"+commande.id_commande)}>
                  <h2>{commande.libelle} - {commande.total} €</h2>
                  <div className='produits'>
                    {commande.produits.length !== 0 ? (
                        commande.produits.map((produit, p_index) => (
                            <div className='produit' style={{margin: "10px 0px 10px 0px"}} key={p_index}>
                                <span style={produit.custom === 1 ? {"color":"yellow"} : {}}> {produit.qte} x {produit.nom} {produit.custom === 1 ? "("+produit.prix+"€)" : ""}</span>
                                {produit.modifications.length !== 0 ? (
                                    produit.modifications.map((modif, m_index) => (
                                      <div className={`coms_modification glo_modificateur_${modif.modificateur}`} key={m_index}>
                                          {modif.modificateur === -1 ? "SANS " : modif.modificateur === 1 ? "SUPPLÉMENT " : ""}{modif.nom}
                                      </div>
                                  ))
                                ) : ""
                                }
                            </div>
                        ))
                    ) : ""
                    }
                  </div>
                  {commande.moyen_paiement !== null ? (
                    <div style={{fontSize:"15px"}}> <hr/> {commande.moyen_paiement === "c" ? "Payé par carte" : commande.moyen_paiement === "o" ? "Offert" : "Payé en espèce"} </div> 
                  ) : (
                    <div className='coms_paiement' onClick={(e) => {
                      e.stopPropagation();
                      paiement_commande(commande);
                    }}>
                      Paiement
                    </div>
                  )}
                </div>
              ))
            ) : ""
            }
          </div>

          {/* Afficher la fenêtre modale si showModal est true */}
          {showModal && (
              <Modal commande={selectedCommande} onClose={handleCloseModal} />
          )}

        </div>
      ))}
    </div>
  );
};

export default Commandes;