import { db, customConsoleLog } from '../index.js';

class Produit {
  static async find() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM produits ORDER BY id_type', async (err, produits) => {
        if (err) reject(err);
        resolve(produits);
      });
    });
  }

  static async get_recette(id_produit){
    return new Promise((resolve, reject) => {
        db.query("SELECT r.*, i.* FROM recette r JOIN ingredients i ON r.id_ingredient=i.id_ingredient WHERE r.id_produit = "+id_produit, (err, recette) =>{
            if(err) reject(err)
            
            return resolve(recette);
        });
    });
  }

  static async getProduitsAffiches(){
      return new Promise((resolve, reject) => {

      db.query("SELECT * FROM produits WHERE display > 0", (err, produits) =>{
          if(err) reject(err)
          else{
            produits.forEach(produit => {
              produit.action = "modifier";
            })

            // frite
            produits.push({id_produit : 3, display : -1, action : "modifier", nom : "Frites", prix_produit : 3});
            // boissons
            produits.push({id_produit : 98, display : -1, action : "setModalBoissons",  nom : "Boissons", prix : 2});
            
            return resolve(produits);
          }
      });
    });
  }

  static async getIngredientsparDate(date) {
    return new Promise((resolve, reject) => {
      var query = "SELECT * FROM pense_bete pb join ingredients i on pb.id_ingredient=i.id_ingredient WHERE pb.date = '"+date+"'";
                  
      db.query(query, (err, ingredients) =>{
          if(err) reject(err)
          if(ingredients.length === 0){
            customConsoleLog("ajout dans les bd des entrées des ingrédients pour "+date);
                  
            db.query("SELECT * FROM ingredients", (err, ingredients) =>{
                if(err) reject(err)
                
                var query = "INSERT INTO pense_bete (date, id_ingredient) VALUES ";
                ingredients.forEach(ingredient => {
                  query += "('"+date+"', "+ingredient.id_ingredient+"),";
                });

                query = query.slice(0, -1);
                
                db.query(query, (err, ingredients) =>{
                  if(err) reject(err)
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
      var query = "UPDATE pense_bete SET checked = "+req.body.checked+" WHERE date = '"+req.body.date+"' AND id_ingredient = "+req.body.id;

      db.query(query, (err, ingredients) =>{
        if(err) reject(err)
        resolve(true);
      });
    });
  }

  static async stockIngredient(req, res) {
    return new Promise((resolve, reject) => {
      var query = "UPDATE pense_bete SET stock = "+req.body.stock+" WHERE date = '"+req.body.date+"' AND id_ingredient = "+req.body.id;

      db.query(query, (err, ingredients) =>{
        if(err) reject(err)
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

      const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = Object.values(data);
      values.push(id_produit);

      const q = `UPDATE produits SET ${fields} WHERE id_produit = ?`;

      db.query(db.format(q, values), (err, result) => {
        if (err) {
          reject(new Error('Erreur lors de la mise à jour du produit: ' + err.message));
        } else if (result.affectedRows === 0) {
          reject(new Error('Aucun produit trouvé avec cet ID.'));
        } else {
          resolve('Produit mis à jour avec succès.');
        }
      });
    });
  }
  
}


export default Produit;