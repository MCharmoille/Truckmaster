import { db, customConsoleLog, moment } from '../index.js';

class Date {
  static async getDates(id_utilisateur) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM dates_travailles WHERE id_utilisateur = ? ORDER BY jour ASC', [id_utilisateur], (err, results) => {
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

  static async getDate(date, id_utilisateur) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM dates_travailles WHERE jour = ? AND id_utilisateur = ?', [date, id_utilisateur], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      });
    });
  }

  static async addDate(data, id_utilisateur) {
    return new Promise((resolve, reject) => {
      var query = "INSERT INTO dates_travailles (jour, cb_midi, cb_soir, id_utilisateur) VALUES (?, ?, ?, ?)";
      const values = [moment(data.jour).format('YYYY-MM-DD'), data.cb_midi, data.cb_soir, id_utilisateur];

      db.query(query, values, (err) => {
        if (err) reject(err)
        resolve(true);
      });
    });
  }

  static async updateCb(data, id_utilisateur) {
    return new Promise((resolve, reject) => {
      // Whitelist columns to prevent injection
      const allowedColumns = ['cb_midi', 'cb_soir'];
      if (!allowedColumns.includes(data.cb)) return reject(new Error("Colonne non autorisée"));

      var query = `UPDATE dates_travailles SET ${data.cb} = ? WHERE id_date = ? AND id_utilisateur = ?`;
      const values = [data.checked, data.id_date, id_utilisateur];

      db.query(query, values, (err) => {
        if (err) reject(err)
        resolve(true);
      });
    });
  }

  static async deleteDate(data, id_utilisateur) {
    return new Promise((resolve, reject) => {
      var query = "DELETE FROM dates_travailles WHERE id_date = ? AND id_utilisateur = ?";
      db.query(query, [data.id_date, id_utilisateur], (err) => {
        if (err) reject(err)
        resolve(true);
      });
    });
  }
}

export default Date;