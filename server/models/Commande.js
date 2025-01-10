import { db, customConsoleLog } from '../index.js';

class Commande {
  static async getCommandeparDate(date) {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM commandes WHERE date_commande LIKE '%"+date+"%' ORDER BY date_commande ASC", async (err, commandes) => {
        if (err) reject(err);
        for (let i = 0; i < commandes.length; i++) {
          try {
            commandes[i] = await this.getCommandeParId(commandes[i].id_commande);
          } catch (error) {
            reject(error);
            return;
          }
        }
        resolve(commandes);
      });
    });
  }

  // Cette fonction doit être la seule qui va chercher les détails d'une commande, toutes les autres doivent passer par la 
  static async getCommandeParId(id_commande){
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM commandes WHERE id_commande = "+id_commande, (err, commande) =>{
          if(err) reject(err)
          
          if(commande.length == 0) reject(new Error("Aucune commande correspondant à l'id "+id_commande));

          commande = {
            ...commande[0],
            total : 0,
            produits : []
          };

          const q2 = "SELECT * FROM produits_commandes pc JOIN produits p ON pc.id_produit=p.id_produit WHERE pc.id_commande = ?";
          db.query(q2, [commande.id_commande], (err, produits_commandes) => {
              if (err) reject(err);
              
              var tempId = 0;

              produits_commandes.forEach((produit_commande) => {
                commande.total += (produit_commande.prix * produit_commande.qte);
                commande.produits.push({
                  ...produit_commande,
                  tempId : tempId,
                  modifications: [],
                });
                tempId ++;
              });

              const pc_ids = produits_commandes.map((produits_commandes) => produits_commandes.id_pc);
              
              const q3 = "SELECT * FROM modifications m JOIN ingredients i ON m.id_ingredient=i.id_ingredient WHERE m.id_pc IN (?)";
              db.query(q3, [pc_ids], (err, modifications) => {
                  if (err) reject(err);
                  // if(typeof modifications === "undefined") return resolve(commande);
                  
                  modifications.forEach((modification) => {
                    const id_pc = modification.id_pc;

                    produits_commandes.forEach((produit_commande) => {
                      if (produit_commande.id_pc === id_pc) {
                          commande.produits.find((p) => p.id_pc === id_pc).modifications.push(modification);
                      }
                    });

                  });

                  return resolve(commande);
              });

              
          });
      })

    });
  }

  static async getResumeparDate(date) {
    try {
      const commandes = await this.getCommandeparDate(date);
      
      const type_produit = [{id_type: 1, nom: "Burgers", produits: [], qte: 0, icon: "burger"},
                            {id_type: 2, nom: "Tacos", produits: [], qte: 0, icon: "tacos"},
                            {id_type: 3, nom: "Boissons", produits: [], qte: 0, icon: "boisson"},
                            {id_type: 4, nom: "Accompagnements", produits: [], qte: 0, icon: "frites"}
                           ];
      const paiements = [{id: "c", nom: "Carte", valeur: 0},
                         {id: "m", nom: "Espèce", valeur: 0},
                         {id: "h", nom: "Chèque", valeur: 0},
                         {id: "o", nom: "Offert", valeur: 0},
                         {id: null, nom: "Non payé", valeur: 0}
                        ];

      commandes.forEach(commande => {
        commande.produits.forEach((produit) => {
          var id_produit = type_produit.find((p) => p.id_type === produit.id_type).produits.find((pr) => pr.id_produit === produit.id_produit);

          if(typeof id_produit === "undefined")
            type_produit.find((p) => p.id_type === produit.id_type).produits.push(produit);
          else 
            type_produit.find((p) => p.id_type === produit.id_type).produits.find((pr) => pr.id_produit === produit.id_produit).qte += parseInt(produit.qte);
          
          type_produit.find((p) => p.id_type === produit.id_type).qte += parseInt(produit.qte);
        });
        paiements.find((p) => p.id === commande.moyen_paiement).valeur += parseFloat(commande.total);
      });

      return({type_produit: type_produit, paiements: paiements});
    } catch (err) {
      customConsoleLog(err);
      throw err;
    }
  }

  static async getStatistiques() {
    try {
      const currentMonth = new Date().getMonth() + 1; // Mois courant (1-12)
      const currentYear = new Date().getFullYear(); // Année courante
  
      const paiementsInitial = [
        { id: "c", nom: "Carte", valeur: 0 },
        { id: "m", nom: "Espèce", valeur: 0 },
        { id: "h", nom: "Chèque", valeur: 0 },
        { id: "o", nom: "Offert", valeur: 0 },
        { id: null, nom: "Non payé", valeur: 0 }
      ];
  
      const statistiques = [];
  
      for (let i = 0; i < 13; i++) {
        const month = (currentMonth - i + 11) % 12 + 1; // Calcul du mois
        const year = currentYear - Math.floor((12 - currentMonth + i) / 12); // Calcul de l'année
  
        const monthString = month < 10 ? `0${month}` : `${month}`; // Formatage du mois
        const commandes = await this.getCommandeparDate(`${year}-${monthString}-`);
  
        const paiements = paiementsInitial.map(p => ({ ...p, valeur: 0 })); // Réinitialiser les paiements pour chaque mois
  
        commandes.forEach(commande => {
          const paiement = paiements.find(p => p.id === commande.moyen_paiement);
          if (paiement) {
            paiement.valeur += parseFloat(commande.total);
          }
        });
  
        statistiques.push({ mois: `${year}-${monthString}`, paiements });
      }
  
      return { statistiques };
    } catch (err) {
      customConsoleLog(err);
      throw err;
    }
  }  

  static async addCommande(req, res){
    return new Promise((resolve, reject) => {
        const q = "INSERT INTO commandes(`libelle`, `date_commande`) VALUES (?)";
        const values = [
            req.body.libelle,
            req.body.date_commande
        ];
        
        db.query(q, [values], (err, data) =>{
            if(err) reject(err)
            else{ 
              customConsoleLog("Une nouvelle commande à été ajoutée (id : "+data.insertId+")");
              // Ajout des lignes dans produits_commandes
              const produits = req.body.produits;
              
              if (produits && produits.length > 0) {
                produits.forEach((produit) => {
                  const q = "INSERT INTO produits_commandes(`id_commande`, `id_produit`, `qte`, `custom`, `prix`) VALUES (?)";
                  const values = [
                    data.insertId,
                    produit.id_produit,
                    produit.qte,
                    ((produit.modifications && produit.modifications.length) > 0  || produit.custom === 1) ? 1 : 0,
                    produit.prix
                  ];
                  
                  db.query(q, [values], (err, pc_data) => {
                    if (err) {
                      console.error("Erreur lors de l'ajout d'une ligne dans produits_commandes : ", err);
                    } else {
                      if(produit.modifications && produit.modifications.length > 0){
                        produit.modifications.forEach((modification) => {
                          const q = "INSERT INTO modifications(`id_pc`, `id_ingredient`, `modificateur`) VALUES (?)";
                          const values = [
                            pc_data.insertId,
                            modification.id_ingredient,
                            modification.modificateur
                          ];
                          
                          db.query(q, [values], (err, modif_data) => {
                            if (err) {
                              console.error("Erreur lors de l'ajout d'une ligne dans modification : ", err);
                            }
                          });
                        });
                      }
                    }
                  });
                });

                return resolve(true);
              }
            }
        });
    });
  }

  static async updateCommande(req, res, id_commande){
    return new Promise((resolve, reject) => {
        const q = "UPDATE commandes SET libelle = '"+req.body.libelle+"', date_commande = '"+req.body.date_commande+"' WHERE id_commande = "+id_commande;
        
        db.query(q, (err, data) =>{
            if(err) reject(err)
            else{ 
              customConsoleLog("La commande "+id_commande+" à été modifiée");
              
              db.query("DELETE pc, m FROM produits_commandes pc LEFT JOIN modifications m ON pc.id_pc=m.id_pc WHERE id_commande = "+id_commande, (err, data) => {
                if(err) reject(err)
                else{
                  customConsoleLog("suppression des anciens pc effectuée");

                  // Ajout des lignes dans produits_commandes
                  const produits = req.body.produits;
                  
                  if (produits && produits.length > 0) {
                    produits.forEach((produit) => {
                      const q = "INSERT INTO produits_commandes(`id_commande`, `id_produit`, `qte`, `custom`, `prix`) VALUES (?)";
                      const values = [
                        id_commande,
                        produit.id_produit,
                        produit.qte,
                        ((produit.modifications && produit.modifications.length) > 0  || produit.custom === 1) ? 1 : 0,
                        produit.prix
                      ];
                      
                      db.query(q, [values], (err, pc_data) => {
                        if (err) {
                          console.error("Erreur lors de l'ajout d'une ligne dans produits_commandes : ", err);
                        } else {
                          customConsoleLog("Une nouvelle ligne a été ajoutée dans produits_commandes");

                          if(produit.modifications && produit.modifications.length > 0){
                            customConsoleLog("ajout de modification pour le produit "+produit.nom);

                            produit.modifications.forEach((modification) => {
                              const q = "INSERT INTO modifications(`id_pc`, `id_ingredient`, `modificateur`) VALUES (?)";
                              const values = [
                                pc_data.insertId,
                                modification.id_ingredient,
                                modification.modificateur
                              ];
                              
                              db.query(q, [values], (err, modif_data) => {
                                if (err) {
                                  console.error("Erreur lors de l'ajout d'une ligne dans modification : ", err);
                                } else {
                                  customConsoleLog("Une nouvelle ligne a été ajoutée dans modification");
                                }
                              });
                            });
                          }
                        }
                      });
                    });

                    return resolve(true);
                  }
                }
              })
            }
        })
    });
  }

  static async supprimerCommande(id_commande){
    return new Promise((resolve, reject) => {
        customConsoleLog("suppression de la commande "+id_commande);
        db.query("DELETE pc, m FROM produits_commandes pc LEFT JOIN modifications m ON pc.id_pc=m.id_pc WHERE id_commande = "+id_commande, (err, data) => {
          if(err) reject(err)
          else{
            customConsoleLog("suppression des anciens pc effectuée");

            db.query("DELETE FROM commandes WHERE id_commande = "+id_commande, (err, data) => {
              if(err) reject(err)
              else{
                customConsoleLog("suppression de la commande effectuée");

                return resolve(true);
              }
            })
          }
        })
    });
  }

  static async paiementCommande(req, res){
    return new Promise((resolve, reject) => {
      const q = "UPDATE commandes SET moyen_paiement = ? WHERE id_commande = ?";
      const values = [
          req.body.moyen_paiement,
          req.body.id_commande
      ];

      db.query(db.format(q, values), (err, data) =>{
          if(err) reject(err)
          else{ 
            customConsoleLog("La commande "+req.body.id_commande+" à correctement été payée");
            
            return resolve(true);
          }
      });
  });
  }
}

export default Commande;