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

  static async updateCb(req, res) {
    return new Promise((resolve, reject) => {
      var query = "UPDATE dates_travailles SET "+req.body.cb+" = "+req.body.checked+" WHERE id_date = "+req.body.id_date;

      db.query(query, (err) =>{
        if(err) reject(err)
        resolve(true);
      });
    });
  }
}

export default Produit;