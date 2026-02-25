import { db, customConsoleLog } from '../index.js';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

class Utilisateur {
  static async login(req) {
    return new Promise((resolve, reject) => {
      var query = "SELECT * FROM utilisateurs WHERE identifiant = ?";

      db.query(query, [req.body.identifiant], async (err, user) => {
        if (err) return reject(err);

        if (user.length !== 1) {
          return resolve(null);
        }

        const isPasswordCorrect = await bcrypt.compare(req.body.password, user[0].motdepasse);
        if (!isPasswordCorrect) {
          return resolve(null);
        }

        var username = user[0].nom;
        var userId = user[0].id;
        const token = jwt.sign({ username, userId }, 'tempsecretkey');
        resolve({ token, username, userId });
      });
    });
  }

  static async getById(id) {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM utilisateurs WHERE id = ?", [id], (err, user) => {
        if (err) return reject(err);
        resolve(user[0]);
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
