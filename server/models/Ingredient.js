import { db, customConsoleLog } from '../index.js';

class Ingredient {
  static async getIngredients(id_utilisateur) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM ingredients WHERE id_utilisateur = ?', [id_utilisateur], async (err, ingredients) => {
        if (err) return reject(err);
        resolve(ingredients);
      });
    });
  }

  static async create(nom, id_utilisateur) {
    return new Promise((resolve, reject) => {
      db.query('INSERT INTO ingredients (nom, id_utilisateur) VALUES (?, ?)', [nom, id_utilisateur], (err, result) => {
        if (err) return reject(err);
        resolve({ id_ingredient: result.insertId, nom: nom, id_utilisateur: id_utilisateur });
      });
    });
  }
}


export default Ingredient;