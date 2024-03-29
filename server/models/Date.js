import { db, customConsoleLog, moment } from '../index.js';

class Produit {
  static async getDates() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM dates_travailles ORDER BY jour ASC', (err, results) => {
        if (err) {
          reject(err);
        } else {
          // Formater les dates avec moment
          const formattedResults = results.map(result => {
            result.jour = moment(result.jour).format('YYYY-MM-DD');
            return result;
          });

          resolve(formattedResults);
        }
      });
    });
  }

  static async getDate(date) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM dates_travailles WHERE jour LIKE "'+date+'"', (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      });
    });
  }

  static async addDate(req, res) {
    return new Promise((resolve, reject) => {
      var query = "INSERT INTO dates_travailles (jour, cb_midi, cb_soir) VALUES ('"+moment(req.body.jour).format('YYYY-MM-DD')+"', "+req.body.cb_midi+", "+req.body.cb_soir+")";

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