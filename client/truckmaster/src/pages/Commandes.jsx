import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Commandes = () => {
  const [commandes, setCommandes] = useState([]);

  useEffect(() => {
    const fetchAllCommandes = async () => {
      try {
        const res = await axios.get('http://37.187.55.12:8800/commandes');
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

  // Ajoute la commande à la tranche horaire correspondante
  commandes.forEach((commande) => {
    const timeCommande = new Date(commande.date_creation).getHours()+":"+new Date(commande.date_creation).getMinutes().toString().padStart(2, '0');;

    const foundTranche = tranches.find((tranche) => tranche.time === timeCommande);

    if (foundTranche) {
      foundTranche.content.push(commande);
    } else {
      console.log("Tranche interdite ! Heure impossible : "+timeCommande);
    }
  });

  return (
    <div>
      {tranches.map((tranche) => (
        <div className="tranche" key={tranche.time}>
          <h2>{tranche.time}</h2>
          <div className="commandes">
            {tranche.content.length !== 0 ? (
              tranche.content.map((commande) => (
                <div className={`commande ${commande.paye === 1 ? 'paye' : ''}`} key={commande.id_commande}>
                  <h2>{commande.libelle}</h2>
                  <div className='produits'>
                    {commande.produits.length !== 0 ? (
                        commande.produits.map((produit) => (
                            <div className='produit' style={{margin: "10px 0px 10px 0px"}}>
                                {produit.qte} x {produit.nom}
                            </div>
                        ))
                    ) : ""
                    }
                  </div>
                </div>
              ))
            ) : ""
            }
          </div>
        </div>
      ))}
    </div>
  );
};

export default Commandes;