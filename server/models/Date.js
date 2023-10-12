import { db } from '../index.js';

class Produit {
  static async getDates() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM dates_travailles ORDER BY jour ASC', (err, results) => {
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