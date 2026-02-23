import { db, customConsoleLog } from '../index.js';

class Achat {
    static async getAchats(filters = {}) {
        return new Promise((resolve, reject) => {
            let q = 'SELECT * FROM achats';
            let params = [];
            let conditions = [];

            if (filters.startDate) {
                conditions.push('date_achat >= ?');
                params.push(filters.startDate);
            }
            if (filters.endDate) {
                conditions.push('date_achat <= ?');
                params.push(filters.endDate);
            }

            if (conditions.length > 0) {
                q += ' WHERE ' + conditions.join(' AND ');
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

    static async create(data) {
        return new Promise((resolve, reject) => {
            const q = "INSERT INTO achats (nom, quantite, prix, date_achat) VALUES (?, ?, ?, ?)";
            const values = [data.nom, data.quantite, data.prix, data.date_achat];
            db.query(q, values, (err, result) => {
                if (err) return reject(err);
                resolve({ id_achat: result.insertId, ...data });
            });
        });
    }

    static async update(id, data) {
        return new Promise((resolve, reject) => {
            const q = "UPDATE achats SET nom = ?, quantite = ?, prix = ?, date_achat = ? WHERE id_achat = ?";
            const values = [data.nom, data.quantite, data.prix, data.date_achat, id];
            db.query(q, values, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM achats WHERE id_achat = ?', [id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }

    static async getStatistiques(startDate, endDate) {
        return new Promise((resolve, reject) => {
            const q = `
                SELECT 
                    DATE_FORMAT(date_achat, '%Y-%m') as mois,
                    SUM(prix) as total_achats
                FROM achats
                WHERE date_achat >= ? AND date_achat <= ?
                GROUP BY mois
                ORDER BY mois ASC
            `;
            db.query(q, [startDate, endDate], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    static async getUniqueNames() {
        return new Promise((resolve, reject) => {
            db.query('SELECT DISTINCT nom FROM achats', (err, results) => {
                if (err) return reject(err);
                resolve(results.map(r => r.nom));
            });
        });
    }
}

export default Achat;
