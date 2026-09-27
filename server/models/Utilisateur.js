import { db } from '../lib/db.js';
import { verifyPassword } from '../lib/password.js';
import { signUserToken } from '../middleware/auth.js';

export function sanitizeUser(row) {
  if (!row) return row;
  const { motdepasse, ...safe } = row;
  return safe;
}

class Utilisateur {
  static async login(req) {
    return new Promise((resolve, reject) => {
      var query = "SELECT * FROM utilisateurs WHERE identifiant = ?";

      db.query(query, [req.body.identifiant], async (err, user) => {
        if (err) return reject(err);

        if (user.length !== 1) {
          return resolve(null);
        }

        const isPasswordCorrect = await verifyPassword(req.body.password, user[0].motdepasse);
        if (!isPasswordCorrect) {
          return resolve(null);
        }

        var username = user[0].nom;
        var userId = user[0].id;
        const token = signUserToken({ username, userId });
        resolve({ token, username, userId });
      });
    });
  }

  static async getById(id) {
    return new Promise((resolve, reject) => {
      const query = "SELECT id, identifiant, nom, logo, adresse, adresse_suite, tel, mail, siret, ai_usage_monthly FROM utilisateurs WHERE id = ?";
      db.query(query, [id], (err, user) => {
        if (err) return reject(err);
        resolve(sanitizeUser(user[0]));
      });
    });
  }

  static async update(id, data) {
    return new Promise((resolve, reject) => {
      const { nom, logo, adresse, adresse_suite, tel, mail, siret } = data;
      const query = "UPDATE utilisateurs SET nom = ?, logo = ?, adresse = ?, adresse_suite = ?, tel = ?, mail = ?, siret = ? WHERE id = ?";
      db.query(query, [nom, logo, adresse, adresse_suite, tel, mail, siret, id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
}

export default Utilisateur;
