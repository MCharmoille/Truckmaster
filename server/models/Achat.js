import { db, customConsoleLog } from '../index.js';

class Achat {
    static async getAchats(filters = {}, id_utilisateur) {
        return new Promise((resolve, reject) => {
            let q = 'SELECT * FROM achats WHERE id_utilisateur = ?';
            let params = [id_utilisateur];

            if (filters.startDate) {
                q += ' AND date_achat >= ?';
                params.push(filters.startDate);
            }
            if (filters.endDate) {
                q += ' AND date_achat <= ?';
                params.push(filters.endDate);
            }

            q += ' ORDER BY date_achat DESC';

            if (filters.limit) {
                q += ' LIMIT ?';
                params.push(parseInt(filters.limit));
            }

            db.query(q, params, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    static async create(data, id_utilisateur) {
        return new Promise((resolve, reject) => {
            const q = "INSERT INTO achats (nom, quantite, prix, date_achat, id_utilisateur) VALUES (?, ?, ?, ?, ?)";
            const values = [data.nom, data.quantite, data.prix, data.date_achat, id_utilisateur];
            db.query(q, values, (err, result) => {
                if (err) return reject(err);
                resolve({ id_achat: result.insertId, ...data, id_utilisateur });
            });
        });
    }

    static async update(id, data, id_utilisateur) {
        return new Promise((resolve, reject) => {
            const q = "UPDATE achats SET nom = ?, quantite = ?, prix = ?, date_achat = ? WHERE id_achat = ? AND id_utilisateur = ?";
            const values = [data.nom, data.quantite, data.prix, data.date_achat, id, id_utilisateur];
            db.query(q, values, (err, result) => {
                if (err) return reject(err);
                if (result.affectedRows === 0) return reject(new Error("Achat introuvable ou non autorisé"));
                resolve(result);
            });
        });
    }

    static async delete(id, id_utilisateur) {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM achats WHERE id_achat = ? AND id_utilisateur = ?', [id, id_utilisateur], (err, result) => {
                if (err) return reject(err);
                if (result.affectedRows === 0) return reject(new Error("Achat introuvable ou non autorisé"));
                resolve(result);
            });
        });
    }

    static async getStatistiques(startDate, endDate, id_utilisateur) {
        return new Promise((resolve, reject) => {
            const q = `
                SELECT 
                    DATE_FORMAT(date_achat, '%Y-%m') as mois,
                    SUM(prix) as total_achats
                FROM achats
                WHERE date_achat >= ? AND date_achat <= ? AND id_utilisateur = ?
                GROUP BY mois
                ORDER BY mois ASC
            `;
            db.query(q, [startDate, endDate, id_utilisateur], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    static async getUniqueNames(id_utilisateur) {
        return new Promise((resolve, reject) => {
            db.query('SELECT DISTINCT nom FROM achats WHERE id_utilisateur = ?', [id_utilisateur], (err, results) => {
                if (err) return reject(err);
                resolve(results.map(r => r.nom));
            });
        });
    }
}

export default Achat;
