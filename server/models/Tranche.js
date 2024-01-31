import { db, customConsoleLog } from '../index.js';

class Produit {
  static async getTranches() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM tranches_horaires ORDER BY is_midi DESC, tranche ASC', (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  static async addTranche(req, res) {
    return new Promise((resolve, reject) => {
      var query = "INSERT INTO tranches_horaires (tranche, is_midi) VALUES ('"+req.body.tranche+"', "+req.body.is_midi+")";
      console.log(query);
      db.query(query, (err) =>{
        if(err) reject(err)
        resolve(true);
      });
    });
  }

  static async deleteTranche(req, res) {
    return new Promise((resolve, reject) => {
      var query = "DELETE FROM tranches_horaires WHERE id_tranche = "+req.body.id_tranche;
      
      db.query(query, (err) =>{
        if(err) reject(err)
        resolve(true);
      });
    });
  }
}

export default Produit;