import { db, customConsoleLog } from '../index.js';

class FactureAchat {
    static async getNextIdPublic(id_utilisateur) {
        return new Promise((resolve, reject) => {
            db.query("SELECT IFNULL(MAX(id_public), 0) + 1 AS nextId FROM factures_achats WHERE id_utilisateur = ?", [id_utilisateur], (err, results) => {
                if (err) return reject(err);
                resolve(results[0].nextId);
            });
        });
    }

    static async create(data, id_utilisateur) {
        return new Promise((resolve, reject) => {
            const { date, id_public } = data;
            db.query("INSERT INTO factures_achats (id_utilisateur, id_public, date) VALUES (?, ?, ?)", [id_utilisateur, id_public, date], (err, result) => {
                if (err) return reject(err);
                resolve({ id: result.insertId, ...data, id_utilisateur });
            });
        });
    }

    static async getAll(id_utilisateur) {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM factures_achats WHERE id_utilisateur = ? ORDER BY date DESC, id DESC", [id_utilisateur], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }
}

export default FactureAchat;
