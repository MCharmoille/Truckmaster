import { db, customConsoleLog } from '../index.js';

class Commande {
  static async getCommandeparDate(date, id_utilisateur) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM commandes WHERE date_commande LIKE ? AND id_utilisateur = ? ORDER BY date_commande ASC",
        [`%${date}%`, id_utilisateur],
        async (err, commandes) => {
          if (err) reject(err);
          for (let i = 0; i < commandes.length; i++) {
            try {
              commandes[i] = await this.getCommandeParId(commandes[i].id_commande, id_utilisateur);
            } catch (error) {
              reject(error);
              return;
            }
          }
          resolve(commandes);
        }
      );
    });
  }

  static async getCommandeParId(id_commande, id_utilisateur) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM commandes WHERE id_commande = ? AND id_utilisateur = ?",
        [id_commande, id_utilisateur],
        (err, commande) => {
          if (err) reject(err)

          if (commande.length == 0) reject(new Error("Aucune commande correspondant à l'id " + id_commande));

          commande = {
            ...commande[0],
            total: 0,
            produits: []
          };

          const q2 = "SELECT * FROM produits_commandes pc JOIN produits p ON pc.id_produit=p.id_produit WHERE pc.id_commande = ?";
          db.query(q2, [commande.id_commande], (err, produits_commandes) => {
            if (err) reject(err);

            var tempId = 0;

            produits_commandes.forEach((produit_commande) => {
              commande.total += (produit_commande.prix * produit_commande.qte);
              commande.produits.push({
                ...produit_commande,
                tempId: tempId,
                modifications: [],
              });
              tempId++;
            });

            if (produits_commandes.length === 0) return resolve(commande);

            const pc_ids = produits_commandes.map((pc) => pc.id_pc);

            const q3 = "SELECT * FROM modifications m JOIN ingredients i ON m.id_ingredient=i.id_ingredient WHERE m.id_pc IN (?)";
            db.query(q3, [pc_ids], (err, modifications) => {
              if (err) reject(err);

              modifications.forEach((modification) => {
                const id_pc = modification.id_pc;
                const foundProduit = commande.produits.find((p) => p.id_pc === id_pc);
                if (foundProduit) {
                  foundProduit.modifications.push(modification);
                }
              });

              return resolve(commande);
            });
          });
        }
      )
    });
  }

  static async getResumeparDate(date, id_utilisateur) {
    try {
      const commandes = await this.getCommandeparDate(date, id_utilisateur);

      const type_produit = [
        { id_type: 1, nom: "Burgers", produits: [], qte: 0 },
        { id_type: 2, nom: "Tacos", produits: [], qte: 0 },
        { id_type: 3, nom: "Boissons", produits: [], qte: 0 },
        { id_type: 4, nom: "Accompagnements", produits: [], qte: 0 }
      ];
      const paiements = [
        { id: "c", nom: "Carte", valeur: 0 },
        { id: "m", nom: "Espèce", valeur: 0 },
        { id: "h", nom: "Chèque", valeur: 0 },
        { id: "o", nom: "Offert", valeur: 0 },
        { id: "v", nom: "Virement", valeur: 0 },
        { id: null, nom: "Non payé", valeur: 0 }
      ];

      commandes.forEach(commande => {
        commande.produits.forEach((produit) => {
          const type = type_produit.find((p) => p.id_type === produit.id_type);
          if (type) {
            let existingProduit = type.produits.find((pr) => pr.id_produit === produit.id_produit);
            if (typeof existingProduit === "undefined") {
              type.produits.push({ ...produit });
            } else {
              existingProduit.qte += parseInt(produit.qte);
            }
            type.qte += parseInt(produit.qte);
          }
        });
        const paiement = paiements.find((p) => p.id === commande.moyen_paiement);
        if (paiement) {
          paiement.valeur += parseFloat(commande.total);
        }
      });

      return ({ type_produit: type_produit, paiements: paiements });
    } catch (err) {
      customConsoleLog(err);
      throw err;
    }
  }

  static async getStatistiques(startDate, endDate, id_utilisateur) {
    return new Promise((resolve, reject) => {
      if (!startDate) startDate = '2000-01-01';
      if (!endDate) endDate = '2100-01-01';

      const q = `
            SELECT 
                DATE_FORMAT(c.date_commande, '%Y-%m') as mois,
                c.moyen_paiement,
                SUM(pc.prix * pc.qte) as total_ventes
            FROM commandes c
            LEFT JOIN produits_commandes pc ON c.id_commande = pc.id_commande
            WHERE c.date_commande >= ? AND c.date_commande <= ? AND c.id_utilisateur = ?
            GROUP BY mois, c.moyen_paiement
            ORDER BY mois ASC
        `;

      db.query(q, [startDate, endDate, id_utilisateur], (err, results) => {
        if (err) return reject(err);

        const paiementsTemplate = [
          { id: "c", nom: "Carte" },
          { id: "m", nom: "Espèce" },
          { id: "h", nom: "Chèque" },
          { id: "o", nom: "Offert" },
          { id: "v", nom: "Virement" },
          { id: null, nom: "Non payé" }
        ];

        const statsMap = new Map();

        results.forEach(row => {
          if (!statsMap.has(row.mois)) {
            const zeroPaiements = paiementsTemplate.map(p => ({ ...p, valeur: 0 }));
            statsMap.set(row.mois, { mois: row.mois, paiements: zeroPaiements });
          }

          const monthStats = statsMap.get(row.mois);
          const paiementEntry = monthStats.paiements.find(p => p.id === row.moyen_paiement);

          if (paiementEntry) {
            paiementEntry.valeur = parseFloat(row.total_ventes) || 0;
          }
        });

        const statistiques = Array.from(statsMap.values());
        return resolve({ statistiques });
      });
    });
  }

  static async addCommande(data, id_utilisateur) {
    return new Promise((resolve, reject) => {
      const q = "INSERT INTO commandes(`libelle`, `date_commande`, `id_utilisateur`) VALUES (?, ?, ?)";
      const values = [data.libelle, data.date_commande, id_utilisateur];

      db.query(q, values, (err, result) => {
        if (err) return reject(err);

        customConsoleLog("Une nouvelle commande a été ajoutée (id : " + result.insertId + ")");
        const produits = data.produits;

        if (produits && produits.length > 0) {
          const promises = produits.map((produit) => {
            return new Promise((resPC, rejPC) => {
              const qPC = "INSERT INTO produits_commandes(`id_commande`, `id_produit`, `qte`, `custom`, `prix`) VALUES (?)";
              const valuesPC = [
                result.insertId,
                produit.id_produit,
                produit.qte,
                ((produit.modifications && produit.modifications.length) > 0 || produit.custom === 1) ? 1 : 0,
                produit.prix
              ];

              db.query(qPC, [valuesPC], (err, pc_data) => {
                if (err) return rejPC(err);

                if (produit.modifications && produit.modifications.length > 0) {
                  const modifPromises = produit.modifications.map((modification) => {
                    return new Promise((resModif, rejModif) => {
                      const qModif = "INSERT INTO modifications(`id_pc`, `id_ingredient`, `modificateur`) VALUES (?)";
                      const valuesModif = [pc_data.insertId, modification.id_ingredient, modification.modificateur];
                      db.query(qModif, [valuesModif], (err) => {
                        if (err) return rejModif(err);
                        resModif();
                      });
                    });
                  });
                  Promise.all(modifPromises).then(resPC).catch(rejPC);
                } else {
                  resPC();
                }
              });
            });
          });
          Promise.all(promises).then(() => resolve(true)).catch(reject);
        } else {
          resolve(true);
        }
      });
    });
  }

  static async updateCommande(data, id_commande, id_utilisateur) {
    return new Promise((resolve, reject) => {
      const q = "UPDATE commandes SET libelle = ?, date_commande = ? WHERE id_commande = ? AND id_utilisateur = ?";
      db.query(q, [data.libelle, data.date_commande, id_commande, id_utilisateur], (err, result) => {
        if (err) return reject(err);

        if (result.affectedRows === 0) return reject(new Error("Commande introuvable ou non autorisée"));

        customConsoleLog("La commande " + id_commande + " a été modifiée");

        db.query("DELETE pc, m FROM produits_commandes pc LEFT JOIN modifications m ON pc.id_pc=m.id_pc WHERE id_commande = ?", [id_commande], (err) => {
          if (err) return reject(err);

          const produits = data.produits;
          if (produits && produits.length > 0) {
            const promises = produits.map((produit) => {
              return new Promise((resPC, rejPC) => {
                const qPC = "INSERT INTO produits_commandes(`id_commande`, `id_produit`, `qte`, `custom`, `prix`) VALUES (?)";
                const valuesPC = [
                  id_commande,
                  produit.id_produit,
                  produit.qte,
                  ((produit.modifications && produit.modifications.length) > 0 || produit.custom === 1) ? 1 : 0,
                  produit.prix
                ];

                db.query(qPC, [valuesPC], (err, pc_data) => {
                  if (err) return rejPC(err);

                  if (produit.modifications && produit.modifications.length > 0) {
                    const modifPromises = produit.modifications.map((modification) => {
                      return new Promise((resModif, rejModif) => {
                        const qModif = "INSERT INTO modifications(`id_pc`, `id_ingredient`, `modificateur`) VALUES (?)";
                        const valuesModif = [pc_data.insertId, modification.id_ingredient, modification.modificateur];
                        db.query(qModif, [valuesModif], (err) => {
                          if (err) return rejModif(err);
                          resModif();
                        });
                      });
                    });
                    Promise.all(modifPromises).then(resPC).catch(rejPC);
                  } else {
                    resPC();
                  }
                });
              });
            });
            Promise.all(promises).then(() => resolve(true)).catch(reject);
          } else {
            resolve(true);
          }
        });
      });
    });
  }

  static async supprimerCommande(id_commande, id_utilisateur) {
    return new Promise((resolve, reject) => {
      // First check ownership
      db.query("SELECT id_commande FROM commandes WHERE id_commande = ? AND id_utilisateur = ?", [id_commande, id_utilisateur], (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return reject(new Error("Commande introuvable ou non autorisée"));

        db.query("DELETE pc, m FROM produits_commandes pc LEFT JOIN modifications m ON pc.id_pc=m.id_pc WHERE id_commande = ?", [id_commande], (err) => {
          if (err) return reject(err);

          db.query("DELETE FROM commandes WHERE id_commande = ? AND id_utilisateur = ?", [id_commande, id_utilisateur], (err) => {
            if (err) return reject(err);
            customConsoleLog("Suppression de la commande " + id_commande + " effectuée");
            resolve(true);
          });
        });
      });
    });
  }

  static async paiementCommande(data, id_utilisateur) {
    return new Promise((resolve, reject) => {
      const q = "UPDATE commandes SET moyen_paiement = ? WHERE id_commande = ? AND id_utilisateur = ?";
      db.query(q, [data.moyen_paiement, data.id_commande, id_utilisateur], (err, result) => {
        if (err) return reject(err);

        if (result.affectedRows === 0) return reject(new Error("Commande introuvable ou non autorisée"));

        customConsoleLog("La commande " + data.id_commande + " a correctement été payée");
        resolve(true);
      });
    });
  }
}

export default Commande;