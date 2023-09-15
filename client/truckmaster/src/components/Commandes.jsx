import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import Modal from "./modals/Paiement";

const Commandes = () => {
  const [commandes, setCommandes] = useState([]);

  // vérifier l'utilité de mettre ce code dans useEffect, fait que ça se recharge souvent
  useEffect(() => {
    const fetchAllCommandes = async () => {
      try {
        const res = await axios.get('https://truckmaster.ovh:8800/commandes');
        setCommandes(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchAllCommandes();
  }, []);

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
  console.log(commandes);
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
      {tranches.map((tranche, t_index) => (
        <div className="tranche" key={t_index}>
          <h2>{tranche.time}</h2>
          <div className="commandes">
            {tranche.content.length !== 0 ? (
              tranche.content.map((commande, c_index) => (
                <div className={`commande ${commande.moyen_paiement !== null ? 'paye' : ''}`} key={c_index}>
                  <h2>{commande.libelle}</h2>
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
                    <div className='paiement' onClick={() => paiement_commande(commande)}>
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