import { db, customConsoleLog } from '../index.js';

class Produit {
  static async getProduits() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM produits WHERE archive = 0 OR archive IS NULL ORDER BY id_type', async (err, produits) => {
        if (err) reject(err);
        resolve(produits);
      });
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

  static async getProduit(id_produit, withStats = false) {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM produits WHERE id_produit = ?", [id_produit], (err, produits) => {
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
                GROUP BY mois
                ORDER BY mois ASC
              `;

              db.query(statsQuery, [id_produit], (err, stats) => {
                if (err) return reject(err);
                produit.stats = stats;
                return resolve(produit);
              });
            } else {
              return resolve(produit);
            }
          }
        );
      });
    });
  }

  static async getProduitsAffiches() {
    return new Promise((resolve, reject) => {

      db.query("SELECT * FROM produits WHERE display > 0", (err, produits) => {
        if (err) reject(err)
        else {
          produits.forEach(produit => {
            produit.action = "modifier";
          })

          // frite
          produits.push({ id_produit: 3, display: -1, action: "modifier", nom: "Frites", prix_produit: 3 });
          // boissons
          produits.push({ id_produit: 98, display: -1, action: "setModalBoissons", nom: "Boissons", prix: 2 });

          return resolve(produits);
        }
      });
    });
  }

  static async getIngredientsparDate(date) {
    return new Promise((resolve, reject) => {
      var query = "SELECT * FROM pense_bete pb join ingredients i on pb.id_ingredient=i.id_ingredient WHERE pb.date = '" + date + "'";

      db.query(query, (err, ingredients) => {
        if (err) reject(err)
        if (ingredients.length === 0) {
          customConsoleLog("ajout dans les bd des entrées des ingrédients pour " + date);

          db.query("SELECT * FROM ingredients", (err, ingredients) => {
            if (err) reject(err)

            var query = "INSERT INTO pense_bete (date, id_ingredient) VALUES ";
            ingredients.forEach(ingredient => {
              query += "('" + date + "', " + ingredient.id_ingredient + "),";
            });

            query = query.slice(0, -1);

            db.query(query, (err, ingredients) => {
              if (err) reject(err)
              resolve(this.getIngredientsparDate(date));
            });

          });

        }
        else resolve(ingredients);
      });
    });
  }

  static async getStocksRestantparDate(date) {
    return new Promise((resolve, reject) => {
      // 1 - Chercher les stocks de chaque ingrédients avec gestion stock == 1
      // 2 - Chercher les produits associés 

      // var query = "SELECT * FROM pense_bete pb join ingredients i on pb.id_ingredient=i.id_ingredient WHERE pb.date = '"+date+"'";

      // db.query(query, (err, ingredients) =>{
      //     if(err) reject(err)
      //     if(ingredients.length === 0){
      //       customConsoleLog("ajout dans les bd des entrées des ingrédients pour "+date);

      //       db.query("SELECT * FROM ingredients", (err, ingredients) =>{
      //           if(err) reject(err)

      //           var query = "INSERT INTO pense_bete (date, id_ingredient) VALUES ";
      //           ingredients.forEach(ingredient => {
      //             query += "('"+date+"', "+ingredient.id_ingredient+"),";
      //           });

      //           query = query.slice(0, -1);

      //           db.query(query, (err, ingredients) =>{
      //             if(err) reject(err)
      //             resolve(this.getIngredientsparDate(date));
      //           });

      //       });

      //     }
      //     else resolve(ingredients);
      // });
    });
  }

  static async checkIngredient(req, res) {
    return new Promise((resolve, reject) => {
      var query = "UPDATE pense_bete SET checked = " + req.body.checked + " WHERE date = '" + req.body.date + "' AND id_ingredient = " + req.body.id;

      db.query(query, (err, ingredients) => {
        if (err) reject(err)
        resolve(true);
      });
    });
  }

  static async stockIngredient(req, res) {
    return new Promise((resolve, reject) => {
      var query = "UPDATE pense_bete SET stock = " + req.body.stock + " WHERE date = '" + req.body.date + "' AND id_ingredient = " + req.body.id;

      db.query(query, (err, ingredients) => {
        if (err) reject(err)
        resolve(true);
      });
    });
  }

  static async save(id_produit, data) {
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

      // Filter out any other non-DB fields that might have been added to the object (like 'stats', etc.)
      const allowedFields = ['nom', 'prix_produit', 'id_type', 'display', 'archive'];
      const filteredData = {};
      Object.keys(data).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredData[key] = data[key];
        }
      });

      const fields = Object.keys(filteredData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(filteredData);
      values.push(id_produit);

      const q = `UPDATE produits SET ${fields} WHERE id_produit = ?`;

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

          // Note: affectedRows can be 0 if the data hasn't changed.
          // In some cases we might want to check if the product actually exists,
          // but for now we skip the strict 0-check to allow "save without changes".
          if (result.affectedRows === 0) {
            customConsoleLog("Avertissement: 0 lignes modifiées pour le produit " + id_produit);
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
                // Si la recette est vide, on commit après avoir supprimé les anciennes
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
            // Si aucune recette n'est fournie, simplement commit la transaction
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


  static async create() {
    return new Promise((resolve, reject) => {
      const q = "INSERT INTO produits (nom, prix_produit, id_type, display) VALUES (?, ?, ?, ?)";
      const values = ["Nouveau produit", 0, 5, 1];

      db.query(q, values, (err, result) => {
        if (err) return reject(err);
        resolve({ id_produit: result.insertId });
      });
    });
  }
}


export default Produit;