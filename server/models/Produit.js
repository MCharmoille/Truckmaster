import { db, customConsoleLog } from '../index.js';

class Produit {
  static async getProduits(id_utilisateur) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM produits WHERE (archive = 0 OR archive IS NULL) AND id_utilisateur = ? ORDER BY id_type',
        [id_utilisateur],
        async (err, produits) => {
          if (err) reject(err);
          resolve(produits);
        }
      );
    });
  }

  static async getTypes() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM type_produit', (err, types) => {
        if (err) reject(err);
        resolve(types);
      });
    });
  }

  static async getProduit(id_produit, id_utilisateur, withStats = false) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM produits WHERE id_produit = ? AND id_utilisateur = ?",
        [id_produit, id_utilisateur],
        (err, produits) => {
          if (err) return reject(err);

          if (produits.length === 0) {
            return reject(new Error("Produit introuvable"));
          }

          const produit = produits[0];

          db.query(
            "SELECT r.*, i.* FROM recette r JOIN ingredients i ON r.id_ingredient = i.id_ingredient WHERE r.id_produit = ?",
            [id_produit],
            (err, recette) => {
              if (err) return reject(err);

              produit.recette = recette;

              if (withStats) {
                const statsQuery = `
                SELECT 
                  DATE_FORMAT(c.date_commande, '%Y-%m') as mois,
                  SUM(pc.qte) as total_ventes
                FROM produits_commandes pc
                JOIN commandes c ON pc.id_commande = c.id_commande
                WHERE pc.id_produit = ? 
                AND c.date_commande >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
                AND c.id_utilisateur = ?
                GROUP BY mois
                ORDER BY mois ASC
              `;

                db.query(statsQuery, [id_produit, id_utilisateur], (err, stats) => {
                  if (err) return reject(err);
                  produit.stats = stats;
                  return resolve(produit);
                });
              } else {
                return resolve(produit);
              }
            }
          );
        }
      );
    });
  }

  static async getProduitsAffiches(id_utilisateur) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM produits WHERE display > 0 AND id_utilisateur = ?",
        [id_utilisateur],
        (err, produits) => {
          if (err) reject(err)
          else {
            produits.forEach(produit => {
              produit.action = "modifier";
            })

            // Note: Frites and Boissons are currently hardcoded or shared. 
            // In a true multi-user env, they should also belong to the user or be a template.
            // Keeping them as-is for now as requested for standard types.

            return resolve(produits);
          }
        }
      );
    });
  }

  static async save(id_produit, id_utilisateur, data) {
    return new Promise((resolve, reject) => {
      if (!id_produit || !data || Object.keys(data).length === 0) {
        reject(new Error('L\'ID du produit et les données sont requis.'));
        return;
      }
      id_produit *= 1;

      if (data.recette) {
        var recette = data.recette;
        delete data.recette;
      }

      const allowedFields = ['nom', 'prix_produit', 'id_type', 'display', 'archive'];
      const filteredData = {};
      Object.keys(data).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredData[key] = data[key];
        }
      });

      const fields = Object.keys(filteredData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(filteredData);

      // Verification that the product belongs to the user
      values.push(id_produit);
      values.push(id_utilisateur);

      const q = `UPDATE produits SET ${fields} WHERE id_produit = ? AND id_utilisateur = ?`;

      db.beginTransaction((err) => {
        if (err) {
          reject(new Error('Erreur lors du début de la transaction: ' + err.message));
          return;
        }

        db.query(db.format(q, values), (err, result) => {
          if (err) {
            customConsoleLog("Erreur SQL update produit: " + err.message);
            db.rollback(() => {
              reject(new Error('Erreur lors de la mise à jour du produit: ' + err.message));
            });
            return;
          }

          if (result.affectedRows === 0) {
            db.rollback(() => {
              reject(new Error("Produit introuvable ou non autorisé"));
            });
            return;
          }

          if (recette && Array.isArray(recette)) {
            const deleteQuery = `DELETE FROM recette WHERE id_produit = ?`;
            db.query(db.format(deleteQuery, [id_produit]), (err) => {
              if (err) {
                db.rollback(() => {
                  reject(new Error('Erreur lors de la suppression des anciennes recettes: ' + err.message));
                });
                return;
              }

              const insertQuery = `INSERT INTO recette (id_produit, id_ingredient, qte) VALUES ?`;
              const recetteValues = recette.map(item => [id_produit, item.id_ingredient, item.qte]);

              if (recetteValues.length === 0) {
                db.commit((err) => {
                  if (err) {
                    db.rollback(() => {
                      reject(new Error('Erreur lors du commit: ' + err.message));
                    });
                    return;
                  }
                  resolve('Produit mis à jour (recette vidée).');
                });
                return;
              }

              db.query(db.format(insertQuery, [recetteValues]), (err) => {
                if (err) {
                  customConsoleLog("Erreur SQL insert recette: " + err.message);
                  db.rollback(() => {
                    reject(new Error('Erreur lors de l\'insertion des nouvelles recettes: ' + err.message));
                  });
                  return;
                }

                db.commit((err) => {
                  if (err) {
                    db.rollback(() => {
                      reject(new Error('Erreur lors du commit de la transaction: ' + err.message));
                    });
                    return;
                  }

                  resolve('Produit et recettes mis à jour avec succès.');
                });
              });
            });
          } else {
            db.commit((err) => {
              if (err) {
                db.rollback(() => {
                  reject(new Error('Erreur lors du commit de la transaction: ' + err.message));
                });
                return;
              }

              resolve('Produit mis à jour avec succès.');
            });
          }
        });
      });
    });
  }

  static async create(id_utilisateur) {
    return new Promise((resolve, reject) => {
      const q = "INSERT INTO produits (nom, prix_produit, id_type, display, id_utilisateur) VALUES (?, ?, ?, ?, ?)";
      const values = ["Nouveau produit", 0, 5, 1, id_utilisateur];

      db.query(q, values, (err, result) => {
        if (err) return reject(err);
        resolve({ id_produit: result.insertId });
      });
    });
  }
}


export default Produit;