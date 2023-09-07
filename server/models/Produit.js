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
}

export default Produit;