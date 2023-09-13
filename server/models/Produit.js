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
}

export default Produit;