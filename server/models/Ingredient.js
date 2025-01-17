import { db, customConsoleLog } from '../index.js';

class Ingredient {
  static async getIngredients() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM ingredients', async (err, ingredients) => {
        if (err) reject(err);
        resolve(ingredients);
      });
    });
  }

//   static async save(id_produit, data) {
//     return new Promise((resolve, reject) => {
//       if (!id_produit || !data || Object.keys(data).length === 0) {
//         reject(new Error('L\'ID du produit et les données sont requis.'));
//         return;
//       }

//       const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
//       const values = Object.values(data);
//       values.push(id_produit);

//       const q = `UPDATE produits SET ${fields} WHERE id_produit = ?`;

//       db.query(db.format(q, values), (err, result) => {
//         if (err) {
//           reject(new Error('Erreur lors de la mise à jour du produit: ' + err.message));
//         } else if (result.affectedRows === 0) {
//           reject(new Error('Aucun produit trouvé avec cet ID.'));
//         } else {
//           resolve('Produit mis à jour avec succès.');
//         }
//       });
//     });
//   }
  
}


export default Ingredient;