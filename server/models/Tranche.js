import { db, customConsoleLog } from '../index.js';

class Tranche {
  static async getTranches(id_utilisateur) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM tranches_horaires WHERE id_utilisateur = ? ORDER BY is_midi DESC, tranche ASC', [id_utilisateur], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  static async addTranche(data, id_utilisateur) {
    return new Promise((resolve, reject) => {
      var query = "INSERT INTO tranches_horaires (tranche, is_midi, id_utilisateur) VALUES (?, ?, ?)";
      const values = [data.tranche, data.is_midi, id_utilisateur];
      db.query(query, values, (err) => {
        if (err) reject(err)
        resolve(true);
      });
    });
  }

  static async deleteTranche(data, id_utilisateur) {
    return new Promise((resolve, reject) => {
      var query = "DELETE FROM tranches_horaires WHERE id_tranche = ? AND id_utilisateur = ?";
      db.query(query, [data.id_tranche, id_utilisateur], (err) => {
        if (err) reject(err)
        resolve(true);
      });
    });
  }
}

export default Tranche;