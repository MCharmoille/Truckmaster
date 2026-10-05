import { db, query, withTransaction } from '../lib/db.js';
import { customConsoleLog } from '../lib/logger.js';
import { dayRange, periodRange } from '../lib/date.js';

export function assembleCommandes(commandes, lignes, modifications) {
  const byCommande = new Map();
  const assembled = commandes.map((commande) => {
    const copy = { ...commande, total: 0, produits: [] };
    byCommande.set(commande.id_commande, copy);
    return copy;
  });

  const byLigne = new Map();
  const nextTempId = new Map();

  for (const ligne of lignes) {
    const commande = byCommande.get(ligne.id_commande);
    if (!commande) continue;

    const tempId = nextTempId.get(ligne.id_commande) ?? 0;
    nextTempId.set(ligne.id_commande, tempId + 1);

    const produit = { ...ligne, tempId, modifications: [] };
    commande.produits.push(produit);
    commande.total += ligne.prix * ligne.qte;
    byLigne.set(ligne.id_pc, produit);
  }

  for (const modification of modifications) {
    const produit = byLigne.get(modification.id_pc);
    if (produit) produit.modifications.push(modification);
  }

  return assembled;
}

async function chargerDetails(commandes) {
  if (commandes.length === 0) return [];

  const ids = commandes.map((commande) => commande.id_commande);
  const lignes = await query(
    db,
    "SELECT * FROM produits_commandes pc JOIN produits p ON pc.id_produit=p.id_produit WHERE pc.id_commande IN (?)",
    [ids]
  );

  const pcIds = lignes.map((ligne) => ligne.id_pc);
  const modifications = pcIds.length === 0
    ? []
    : await query(
      db,
      "SELECT * FROM modifications m JOIN ingredients i ON m.id_ingredient=i.id_ingredient WHERE m.id_pc IN (?)",
      [pcIds]
    );

  return assembleCommandes(commandes, lignes, modifications);
}

function supprimerLignes(conn, id_commande) {
  return query(
    conn,
    "DELETE pc, m FROM produits_commandes pc LEFT JOIN modifications m ON pc.id_pc=m.id_pc WHERE id_commande = ?",
    [id_commande]
  );
}

async function insertLignes(conn, id_commande, produits) {
  if (!produits || produits.length === 0) return;

  for (const produit of produits) {
    const hasModifications = produit.modifications && produit.modifications.length > 0;
    const custom = (hasModifications || produit.custom === 1) ? 1 : 0;
    const pc = await query(
      conn,
      "INSERT INTO produits_commandes(`id_commande`, `id_produit`, `qte`, `custom`, `prix`) VALUES (?)",
      [[id_commande, produit.id_produit, produit.qte, custom, produit.prix]]
    );

    if (hasModifications) {
      const values = produit.modifications.map((modification) => [
        pc.insertId,
        modification.id_ingredient,
        modification.modificateur,
      ]);
      await query(
        conn,
        "INSERT INTO modifications(`id_pc`, `id_ingredient`, `modificateur`) VALUES ?",
        [values]
      );
    }
  }
}

class Commande {
  static async getCommandeparDate(periode, id_utilisateur) {
    const [start, end] = periodRange(periode);
    const commandes = await query(
      db,
      "SELECT * FROM commandes WHERE date_commande >= ? AND date_commande < ? AND id_utilisateur = ? ORDER BY date_commande ASC",
      [start, end, id_utilisateur]
    );
    return chargerDetails(commandes);
  }

  static async getCommandeParId(id_commande, id_utilisateur) {
    const commandes = await query(
      db,
      "SELECT * FROM commandes WHERE id_commande = ? AND id_utilisateur = ?",
      [id_commande, id_utilisateur]
    );
    if (commandes.length === 0) {
      throw new Error("Aucune commande correspondant à l'id " + id_commande);
    }

    const [commande] = await chargerDetails(commandes);
    return commande;
  }

  static async getResumeparDate(date, id_utilisateur) {
    try {
      const commandes = await this.getCommandeparDate(date, id_utilisateur);

      const type_produit = [
        { id_type: 1, nom: "Burgers", produits: [], qte: 0 },
        { id_type: 2, nom: "Tacos", produits: [], qte: 0 },
        { id_type: 3, nom: "Boissons", produits: [], qte: 0 },
        { id_type: 4, nom: "Accompagnements", produits: [], qte: 0 }
      ];
      const paiements = [
        { id: "c", nom: "Carte", valeur: 0 },
        { id: "m", nom: "Espèce", valeur: 0 },
        { id: "h", nom: "Chèque", valeur: 0 },
        { id: "o", nom: "Offert", valeur: 0 },
        { id: "v", nom: "Virement", valeur: 0 },
        { id: null, nom: "Non payé", valeur: 0 }
      ];

      commandes.forEach(commande => {
        commande.produits.forEach((produit) => {
          const type = type_produit.find((p) => p.id_type === produit.id_type);
          if (type) {
            let existingProduit = type.produits.find((pr) => pr.id_produit === produit.id_produit);
            if (typeof existingProduit === "undefined") {
              type.produits.push({ ...produit });
            } else {
              existingProduit.qte += parseInt(produit.qte);
            }
            type.qte += parseInt(produit.qte);
          }
        });
        const paiement = paiements.find((p) => p.id === commande.moyen_paiement);
        if (paiement) {
          paiement.valeur += parseFloat(commande.total);
        }
      });

      return ({ type_produit: type_produit, paiements: paiements });
    } catch (err) {
      customConsoleLog(err);
      throw err;
    }
  }

  static async getStatistiques(startDate, endDate, id_utilisateur) {
    const start = dayRange(startDate || '2000-01-01')[0];
    const end = dayRange(endDate || '2099-12-31')[1];

    return new Promise((resolve, reject) => {
      const q = `
            SELECT 
                DATE_FORMAT(c.date_commande, '%Y-%m') as mois,
                c.moyen_paiement,
                SUM(pc.prix * pc.qte) as total_ventes
            FROM commandes c
            LEFT JOIN produits_commandes pc ON c.id_commande = pc.id_commande
            WHERE c.date_commande >= ? AND c.date_commande < ? AND c.id_utilisateur = ?
            GROUP BY mois, c.moyen_paiement
            ORDER BY mois ASC
        `;

      db.query(q, [start, end, id_utilisateur], (err, results) => {
        if (err) return reject(err);

        const paiementsTemplate = [
          { id: "c", nom: "Carte" },
          { id: "m", nom: "Espèce" },
          { id: "h", nom: "Chèque" },
          { id: "o", nom: "Offert" },
          { id: "v", nom: "Virement" },
          { id: null, nom: "Non payé" }
        ];

        const statsMap = new Map();

        results.forEach(row => {
          if (!statsMap.has(row.mois)) {
            const zeroPaiements = paiementsTemplate.map(p => ({ ...p, valeur: 0 }));
            statsMap.set(row.mois, { mois: row.mois, paiements: zeroPaiements });
          }

          const monthStats = statsMap.get(row.mois);
          const paiementEntry = monthStats.paiements.find(p => p.id === row.moyen_paiement);

          if (paiementEntry) {
            paiementEntry.valeur = parseFloat(row.total_ventes) || 0;
          }
        });

        const statistiques = Array.from(statsMap.values());
        return resolve({ statistiques });
      });
    });
  }

  static async addCommande(data, id_utilisateur) {
    const id = await withTransaction(async (conn) => {
      const result = await query(
        conn,
        "INSERT INTO commandes(`libelle`, `date_commande`, `id_utilisateur`) VALUES (?, ?, ?)",
        [data.libelle, data.date_commande, id_utilisateur]
      );
      await insertLignes(conn, result.insertId, data.produits);
      return result.insertId;
    });

    customConsoleLog("Une nouvelle commande a été ajoutée (id : " + id + ")");
    return true;
  }

  static async updateCommande(data, id_commande, id_utilisateur) {
    await withTransaction(async (conn) => {
      const result = await query(
        conn,
        "UPDATE commandes SET libelle = ?, date_commande = ? WHERE id_commande = ? AND id_utilisateur = ?",
        [data.libelle, data.date_commande, id_commande, id_utilisateur]
      );

      if (result.affectedRows === 0) {
        throw new Error("Commande introuvable ou non autorisée");
      }

      await supprimerLignes(conn, id_commande);
      await insertLignes(conn, id_commande, data.produits);
    });

    customConsoleLog("La commande " + id_commande + " a été modifiée");
    return true;
  }

  static async supprimerCommande(id_commande, id_utilisateur) {
    await withTransaction(async (conn) => {
      const results = await query(
        conn,
        "SELECT id_commande FROM commandes WHERE id_commande = ? AND id_utilisateur = ?",
        [id_commande, id_utilisateur]
      );
      if (results.length === 0) {
        throw new Error("Commande introuvable ou non autorisée");
      }

      await supprimerLignes(conn, id_commande);
      await query(
        conn,
        "DELETE FROM commandes WHERE id_commande = ? AND id_utilisateur = ?",
        [id_commande, id_utilisateur]
      );
    });

    customConsoleLog("Suppression de la commande " + id_commande + " effectuée");
    return true;
  }

  static async paiementCommande(data, id_utilisateur) {
    return new Promise((resolve, reject) => {
      const q = "UPDATE commandes SET moyen_paiement = ? WHERE id_commande = ? AND id_utilisateur = ?";
      db.query(q, [data.moyen_paiement, data.id_commande, id_utilisateur], (err, result) => {
        if (err) return reject(err);

        if (result.affectedRows === 0) return reject(new Error("Commande introuvable ou non autorisée"));

        customConsoleLog("La commande " + data.id_commande + " a correctement été payée");
        resolve(true);
      });
    });
  }
}

export default Commande;