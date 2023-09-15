import { db } from '../index.js';

class Commande {
  static async find() {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM commandes", (err, commandes) =>{
          if(err) reject(err)
          
          const commandes_ids = commandes.map((commandes) => commandes.id_commande);
          
          const q2 = "SELECT * FROM produits_commandes pc JOIN produits p ON pc.id_produit=p.id_produit WHERE pc.id_commande IN (?)";
          db.query(q2, [commandes_ids], (err, produits_commandes) => {
              if (err) return res.json(err);
              
              const commandes_map = new Map();

              commandes.forEach((commandes) => {
                commandes_map.set(commandes.id_commande, {
                      ...commandes,
                      total: 0,
                      produits: [],
                  });
              });
              
              produits_commandes.forEach((produit_commande) => {
                  const id_commande = produit_commande.id_commande;
                  if (commandes_map.has(id_commande)) {
                    commandes_map.get(id_commande).total += (produit_commande.prix * produit_commande.qte);
                    commandes_map.get(id_commande).produits.push({
                      ...produit_commande,
                      modifications: [], // Initialisez le tableau de modifications ici
                    });
                  }
              });

              const pc_ids = produits_commandes.map((produits_commandes) => produits_commandes.id_pc);

              const q3 = "SELECT * FROM modifications m JOIN ingredients i ON m.id_ingredient=i.id_ingredient WHERE m.id_pc IN (?)";
              db.query(q3, [pc_ids], (err, modifications) => {
                  if (err) return res.json(err);
                  
                  modifications.forEach((modification) => {
                    const id_pc = modification.id_pc;

                    produits_commandes.forEach((produit_commande) => {
                      if (produit_commande.id_pc === id_pc) {
                          const id_commande = produit_commande.id_commande;
                          
                          if (commandes_map.has(id_commande)) {
                            commandes_map.get(id_commande).produits.find((p) => p.id_pc === id_pc).modifications.push(modification);
                          }
                      }
                    });

                  });

                  const result = Array.from(commandes_map.values());
                  return resolve(result);
                  
              });

              
          });
      })

    });
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
              console.log("Une nouvelle commande à été ajoutée");
              // Ajout des lignes dans produits_commandes
              const produits = req.body.produits;
              
              if (produits && produits.length > 0) {
                produits.forEach((produit) => {
                  const q = "INSERT INTO produits_commandes(`id_commande`, `id_produit`, `qte`, `custom`) VALUES (?)";
                  const values = [
                    data.insertId,
                    produit.id,
                    produit.qte,
                    produit.modifications && produit.modifications.length > 0 ? 1 : 0
                  ];
                  
                  db.query(q, [values], (err, pc_data) => {
                    if (err) {
                      console.error("Erreur lors de l'ajout d'une ligne dans produits_commandes : ", err);
                    } else {
                      console.log("Une nouvelle ligne a été ajoutée dans produits_commandes");

                      if(produit.modifications && produit.modifications.length > 0){
                        console.log("ajout de modification pour le produit "+produit.nom);

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
                              console.log("Une nouvelle ligne a été ajoutée dans modification");
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
            console.log("La commande "+req.body.id_commande+" à correctement été payée");
            
            return resolve(true);
          }
      });
  });
  }
}

export default Commande;