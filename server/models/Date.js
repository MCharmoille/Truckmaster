import { db, customConsoleLog } from '../index.js';

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

  static async addDate(req, res) {
    return new Promise((resolve, reject) => {
      const dateObj = new Date(req.body.jour);

      var query = "INSERT INTO dates_travailles (jour, cb_midi, cb_soir) VALUES ('"+`${dateObj.getUTCFullYear()}-${String(dateObj.getUTCMonth() + 1).padStart(2, '0')}-${String(dateObj.getUTCDate()).padStart(2, '0')}`+"', "+req.body.cb_midi+", "+req.body.cb_soir+")";

      db.query(query, (err) =>{
        if(err) reject(err)
        resolve(true);
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

  static async deleteDate(req, res) {
    return new Promise((resolve, reject) => {
      var query = "DELETE FROM dates_travailles WHERE id_date = "+req.body.id_date;

      db.query(query, (err) =>{
        if(err) reject(err)
        resolve(true);
      });
    });
  }
}

export default Produit;