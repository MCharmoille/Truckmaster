import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import Modal from "./modals/Paiement";
import Calendrier from './Calendrier';
import { useNavigate } from 'react-router-dom';

const Commandes = () => {
  const [commandes, setCommandes] = useState([]);
  const [selectedDate, setSelectedDate] = useState({jour: null, cb_midi: true, cb_soir: true});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommandesForDate = async () => {
      if (selectedDate.jour !== null) {
        try {
          const formattedDate = moment(selectedDate.jour).format('YYYY-MM-DD');
          
          const res = await axios.get(`${process.env.REACT_APP_API_URL}commandes/date/${formattedDate}`);
          setCommandes(res.data);
        } catch (err) {
          console.log(err);
        }
      }
    };

    fetchCommandesForDate();
  }, [selectedDate]);

  const tranches = [];

  // Heure de départ pour la première période
  let heure1 = 11;
  let minute1 = 0;

  // Boucle pour créer les tranches de 11h à 14h
  for (let i = 0; i < 13; i++) {
    tranches.push({
      time: `${heure1.toString().padStart(2, '0')}:${minute1.toString().padStart(2, '0')}`,
      type: 1, // midi
      content: [],
    });

    minute1 += 15;
    if (minute1 === 60) {
      heure1++;
      minute1 = 0;
    }
  }

  // Heure de départ pour la deuxième période
  let heure2 = 18;
  let minute2 = 30;

  // Boucle pour créer les tranches de 18h30 à minuit
  for (let i = 0; i < 22; i++) {
    tranches.push({
      time: `${heure2.toString().padStart(2, '0')}:${minute2.toString().padStart(2, '0')}`,
      type: 2, // soir
      content: [],
    });

    minute2 += 15;
    if (minute2 === 60) {
      heure2++;
      minute2 = 0;
    }
  }

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };
  
  // Ajoute la commande à la tranche horaire correspondante
  commandes.forEach((commande) => {
    const timeCommande = moment(commande.date_commande).format('HH:mm');

    const foundTranche = tranches.find((tranche) => tranche.time === timeCommande);

    if (foundTranche) {
      foundTranche.content.push(commande);
    } else {
      console.log("Tranche interdite ! Heure impossible : "+timeCommande);
    }
  });

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
      <div className='filtre_commandes'>
        <input type="checkbox" id="cb_midi" name="cb_midi" checked={selectedDate.cb_midi} onChange={(e) => checkCb(e)}/> Midi 
        <input type="checkbox" id="cb_soir" name="cb_soir" checked={selectedDate.cb_soir} onChange={(e) => checkCb(e)}/> Soir
      </div>
      {tranches.map((tranche, t_index) => (
        <div className={"tranche" + (tranche.type === 1 ? (!selectedDate.cb_midi ? " hidden" : "") : (!selectedDate.cb_soir ? " hidden" : ""))} key={t_index}>
          <h2>{tranche.time}</h2>
          <div className="commandes">
            {tranche.content.length !== 0 ? (
              tranche.content.map((commande, c_index) => (
                <div className={`commande ${commande.moyen_paiement !== null ? 'paye' : ''}`} key={c_index} onClick={() => navigate("/add/"+commande.id_commande)}>
                  <h2>{commande.libelle} - {commande.total} €</h2>
                  <div className='produits'>
                    {commande.produits.length !== 0 ? (
                        commande.produits.map((produit, p_index) => (
                            <div className='produit' style={{margin: "10px 0px 10px 0px"}} key={p_index}>
                                <span style={produit.prix_custom !== null ? {"color":"yellow"} : {}}> {produit.qte} x {produit.nom} {produit.prix_custom !== null ? "("+produit.prix+"€)" : ""}</span>
                                {produit.modifications.length !== 0 ? (
                                    produit.modifications.map((modif, m_index) => (
                                      <div className={`modification modificateur_${modif.modificateur}`} key={m_index}>
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
                    null 
                  ) : (
                    <div className='paiement' onClick={(e) => {
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