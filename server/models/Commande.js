import { db } from '../index.js';

class Commande {
  static async find() {
    return new Promise((resolve, reject) => {
      console.log("Demande recu par le modele");
      db.query("SELECT * FROM commandes", (err, commandes) =>{
          if(err) reject(err)
          console.log(commandes);
          const commandes_ids = commandes.map((commandes) => commandes.id_commande);
          
          const q2 = "SELECT * FROM produits_commandes pc JOIN produits p ON pc.id_produit=p.id_produit WHERE pc.id_commande IN (?)";
          console.log(q2);
          db.query(q2, [commandes_ids], (err, produits_commandes) => {
              if (err) return res.json(err);
              console.log(produits_commandes);
              const commandes_map = new Map();

              commandes.forEach((commandes) => {
                commandes_map.set(commandes.id_commande, {
                      ...commandes,
                      produits: [],
                  });
              });
              
              produits_commandes.forEach((produit_commande) => {
                  const id_commande = produit_commande.id_commande;
                  if (commandes_map.has(id_commande)) {
                    commandes_map.get(id_commande).produits.push(produit_commande);
                  }
              });

              const result = Array.from(commandes_map.values());
              return resolve(result);
          });
      })

    });
  }

  static async addCommande(req, res){
    return new Promise((resolve, reject) => {
        const q = "INSERT INTO commandes(`libelle`, `date_creation`, `date_prevu`) VALUES (?)";
        const values = [
            req.body.libelle,
            req.body.date_creation,
            req.body.date_prevu
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
                    1,
                    produit.qte,
                    0
                  ];

                  db.query(q, [values], (err, pc_data) => {
                    if (err) {
                      console.error("Erreur lors de l'ajout d'une ligne dans produits_commandes : ", err);
                    } else {
                      console.log("Une nouvelle ligne a été ajoutée dans produits_commandes");
                    }
                  });
                });
              }
            }
        });
    });
  }
}

export default Commande;