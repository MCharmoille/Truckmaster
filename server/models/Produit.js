import { db } from '../index.js';

class Produit {
  static async find() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM produits', (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  static async get_recette(req, res){
    return new Promise((resolve, reject) => {
        const q = "SELECT r.*, i.* FROM recette r JOIN ingredients i ON r.id_ingredient=i.id_ingredient WHERE r.id_produit = (?)";
        db.query(q, [req.query.id_produit], (err, recette) =>{
            if(err) reject(err)
            else{
              return resolve(recette);
            }
        });
    });
  }

  static async getProduitsAffiches(type = null){
      return new Promise((resolve, reject) => {
      if(type == null) type = 1;

      db.query("SELECT * FROM produits WHERE id_type IN ("+type+", 3)", (err, produits) =>{
          if(err) reject(err)
          else{
            produits.forEach(produit => {
              produit.action = "modifier";
            })

            // switch
            produits.push({id_produit : 99, display : 1, action : "switchTypeProduit",  nom : "", prix : 0});
            // frite
            produits.push({id_produit : 3, display : 1, action : "modifier", nom : "Frite", prix : 3});
            // boissons
            produits.push({id_produit : 98, display : 1, action : "setModalBoissons",  nom : "Boisson", prix : 2});
            
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
            console.log("ajout dans les bd des entrées des ingrédients pour "+date);
                  
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
      //       console.log("ajout dans les bd des entrées des ingrédients pour "+date);
                  
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
}


export default Produit;