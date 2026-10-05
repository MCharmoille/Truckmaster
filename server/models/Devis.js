import { db, query, withTransaction } from '../lib/db.js';

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
        const { nom, adresse, adresse_suite, date_commande, produits } = data;

        return withTransaction(async (conn) => {
            const [next] = await query(
                conn,
                "SELECT IFNULL(MAX(id_public), 0) + 1 AS nextId FROM devis WHERE id_utilisateur = ? FOR UPDATE",
                [id_utilisateur]
            );

            const result = await query(
                conn,
                "INSERT INTO devis (nom, adresse, adresse_suite, date_creation, id_utilisateur, id_public) VALUES (?, ?, ?, ?, ?, ?)",
                [nom, adresse, adresse_suite, date_commande, id_utilisateur, next.nextId]
            );
            const devisId = result.insertId;

            if (produits && produits.length > 0) {
                const values = produits.map(p => [devisId, p.id_produit, p.quantite, p.prix]);
                await query(conn, "INSERT INTO devis_produits (id_devis, id_produit, quantite, prix) VALUES ?", [values]);
            }

            return { id: devisId };
        });
    }

    static async update(id, data, id_utilisateur) {
        const { nom, adresse, adresse_suite, date_commande, produits } = data;
        const q = "UPDATE devis SET nom = ?, adresse = ?, adresse_suite = ?, date_creation = ? WHERE id = ? AND id_utilisateur = ?";

        return withTransaction(async (conn) => {
            const result = await query(conn, q, [nom, adresse, adresse_suite, date_commande, id, id_utilisateur]);
            if (result.affectedRows === 0) {
                throw new Error("Devis introuvable ou non autorisé");
            }

            await query(conn, "DELETE FROM devis_produits WHERE id_devis = ?", [id]);

            if (produits && produits.length > 0) {
                const values = produits.map(p => [id, p.id_produit, p.quantite, p.prix]);
                await query(conn, "INSERT INTO devis_produits (id_devis, id_produit, quantite, prix) VALUES ?", [values]);
            }

            return true;
        });
    }

    static async delete(id, id_utilisateur) {
        return withTransaction(async (conn) => {
            const results = await query(conn, "SELECT id FROM devis WHERE id = ? AND id_utilisateur = ?", [id, id_utilisateur]);
            if (results.length === 0) {
                throw new Error("Devis introuvable ou non autorisé");
            }

            await query(conn, "DELETE FROM devis_produits WHERE id_devis = ?", [id]);
            await query(conn, "DELETE FROM devis WHERE id = ? AND id_utilisateur = ?", [id, id_utilisateur]);
            return true;
        });
    }
}

export default Devis;
