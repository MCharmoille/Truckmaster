import { db, customConsoleLog } from '../index.js';

class Devis {
    static async getAll(id_utilisateur) {
        return new Promise((resolve, reject) => {
            const q = "SELECT *, date_creation as date_commande FROM devis WHERE id_utilisateur = ? ORDER BY id DESC";
            db.query(q, [id_utilisateur], (err, devis) => {
                if (err) return reject(err);
                if (devis.length === 0) return resolve([]);

                const devisIds = devis.map((d) => d.id);
                const q2 = "SELECT dp.*, p.nom as nom_produit, p.prix_produit FROM devis_produits dp JOIN produits p ON dp.id_produit = p.id_produit WHERE dp.id_devis IN (?)";
                db.query(q2, [devisIds], (err, devisProduits) => {
                    if (err) return reject(err);

                    const devisMap = new Map();
                    devis.forEach((d) => {
                        devisMap.set(d.id, { ...d, devis_produits: [] });
                    });

                    devisProduits.forEach((dp) => {
                        if (devisMap.has(dp.id_devis)) {
                            devisMap.get(dp.id_devis).devis_produits.push(dp);
                        }
                    });

                    resolve(Array.from(devisMap.values()));
                });
            });
        });
    }

    static async getById(id, id_utilisateur) {
        return new Promise((resolve, reject) => {
            db.query("SELECT *, date_creation as date_commande FROM devis WHERE id = ? AND id_utilisateur = ?", [id, id_utilisateur], (err, devis) => {
                if (err) return reject(err);
                if (devis.length === 0) return resolve(null);

                const d = devis[0];
                db.query("SELECT dp.*, p.nom as nom_produit, p.prix_produit FROM devis_produits dp JOIN produits p ON dp.id_produit = p.id_produit WHERE dp.id_devis = ?", [id], (err, produits) => {
                    if (err) return reject(err);
                    d.devis_produits = produits;
                    resolve(d);
                });
            });
        });
    }

    static async create(data, id_utilisateur) {
        return new Promise((resolve, reject) => {
            const { nom, adresse, adresse_suite, date_commande, produits } = data;
            
            db.query("SELECT IFNULL(MAX(id_public), 0) + 1 AS nextId FROM devis WHERE id_utilisateur = ?", [id_utilisateur], (err, maxRes) => {
                if (err) return reject(err);
                
                const nextIdPublic = maxRes[0].nextId;

                const q = "INSERT INTO devis (nom, adresse, adresse_suite, date_creation, id_utilisateur, id_public) VALUES (?, ?, ?, ?, ?, ?)";
                db.query(q, [nom, adresse, adresse_suite, date_commande, id_utilisateur, nextIdPublic], (err, result) => {
                    if (err) return reject(err);
                    const devisId = result.insertId;

                    if (produits && produits.length > 0) {
                        const values = produits.map(p => [devisId, p.id_produit, p.quantite, p.prix]);
                        db.query("INSERT INTO devis_produits (id_devis, id_produit, quantite, prix) VALUES ?", [values], (err) => {
                            if (err) return reject(err);
                            resolve({ id: devisId });
                        });
                    } else {
                        resolve({ id: devisId });
                    }
                });
            });
        });
    }

    static async update(id, data, id_utilisateur) {
        return new Promise((resolve, reject) => {
            const { nom, adresse, adresse_suite, date_commande, produits } = data;
            const q = "UPDATE devis SET nom = ?, adresse = ?, adresse_suite = ?, date_creation = ? WHERE id = ? AND id_utilisateur = ?";

            db.beginTransaction(err => {
                if (err) return reject(err);

                db.query(q, [nom, adresse, adresse_suite, date_commande, id, id_utilisateur], (err, result) => {
                    if (err) return db.rollback(() => reject(err));

                    if (result.affectedRows === 0) return db.rollback(() => reject(new Error("Devis introuvable ou non autorisé")));

                    db.query("DELETE FROM devis_produits WHERE id_devis = ?", [id], (err) => {
                        if (err) return db.rollback(() => reject(err));

                        if (produits && produits.length > 0) {
                            const values = produits.map(p => [id, p.id_produit, p.quantite, p.prix]);
                            db.query("INSERT INTO devis_produits (id_devis, id_produit, quantite, prix) VALUES ?", [values], (err) => {
                                if (err) return db.rollback(() => reject(err));
                                db.commit(err => {
                                    if (err) return db.rollback(() => reject(err));
                                    resolve(true);
                                });
                            });
                        } else {
                            db.commit(err => {
                                if (err) return db.rollback(() => reject(err));
                                resolve(true);
                            });
                        }
                    });
                });
            });
        });
    }

    static async delete(id, id_utilisateur) {
        return new Promise((resolve, reject) => {
            db.beginTransaction(err => {
                if (err) return reject(err);

                // First check ownership
                db.query("SELECT id FROM devis WHERE id = ? AND id_utilisateur = ?", [id, id_utilisateur], (err, results) => {
                    if (err) return db.rollback(() => reject(err));
                    if (results.length === 0) return db.rollback(() => reject(new Error("Devis introuvable ou non autorisé")));

                    db.query("DELETE FROM devis_produits WHERE id_devis = ?", [id], (err) => {
                        if (err) return db.rollback(() => reject(err));
                        db.query("DELETE FROM devis WHERE id = ? AND id_utilisateur = ?", [id, id_utilisateur], (err) => {
                            if (err) return db.rollback(() => reject(err));
                            db.commit(err => {
                                if (err) return db.rollback(() => reject(err));
                                resolve(true);
                            });
                        });
                    });
                });
            });
        });
    }
}

export default Devis;
