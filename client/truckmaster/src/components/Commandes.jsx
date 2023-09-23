import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import Modal from "./modals/Paiement";
import Calendrier from './Calendrier';
import { useNavigate } from 'react-router-dom';

const Commandes = () => {
  const [commandes, setCommandes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommandesForDate = async () => {
      if (selectedDate) {
        try {
          const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
          
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
  
  // Heure de départ
  let heure = 18;
  let minute = 0;
  
  // Boucle pour créer les 20 tranches
  for (let i = 0; i < 20; i++) {
    tranches.push({
      time: `${heure.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      content: [],
    });
  
    minute += 15;
    if (minute === 60) {
      heure++;
      minute = 0;
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
  
  return (
    <div>
      <Calendrier onDateChange={handleDateChange} />
      {tranches.map((tranche, t_index) => (
        <div className="tranche" key={t_index}>
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
                                {produit.qte} x {produit.nom}
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