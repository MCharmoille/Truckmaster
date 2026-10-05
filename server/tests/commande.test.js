import { describe, it, expect, vi, beforeEach } from 'vitest';

const { conn, getConnection, poolQuery } = vi.hoisted(() => {
    const conn = {
        beginTransaction: vi.fn((cb) => cb(null)),
        commit: vi.fn((cb) => cb(null)),
        rollback: vi.fn((cb) => cb(null)),
        release: vi.fn(),
        query: vi.fn(),
    };
    const getConnection = vi.fn((cb) => cb(null, conn));
    const poolQuery = vi.fn();
    return { conn, getConnection, poolQuery };
});

vi.mock('../lib/db.js', () => ({
    db: { getConnection, query: poolQuery },
    query: (target, sql, params) => new Promise((resolve, reject) => {
        target.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)));
    }),
    withTransaction: (work) => new Promise((resolve, reject) => {
        getConnection((err, c) => {
            if (err) return reject(err);
            c.beginTransaction((beginErr) => {
                if (beginErr) {
                    c.release();
                    return reject(beginErr);
                }
                Promise.resolve()
                    .then(() => work(c))
                    .then((result) => {
                        c.commit((commitErr) => {
                            if (commitErr) {
                                c.rollback(() => {
                                    c.release();
                                    reject(commitErr);
                                });
                                return;
                            }
                            c.release();
                            resolve(result);
                        });
                    })
                    .catch((workErr) => {
                        c.rollback(() => {
                            c.release();
                            reject(workErr);
                        });
                    });
            });
        });
    }),
}));

import Commande, { assembleCommandes } from '../models/Commande.js';

function failOnQuery(n) {
    let calls = 0;
    conn.query.mockImplementation((sql, params, cb) => {
        calls += 1;
        if (calls === n) cb(new Error('insert failed'));
        else cb(null, { insertId: 42, affectedRows: 1 });
    });
}

describe('assembleCommandes', () => {
    it('sums line totals and attaches each modification to its line', () => {
        const commandes = [{ id_commande: 1, libelle: 'A', moyen_paiement: null }];
        const lignes = [
            { id_commande: 1, id_pc: 10, id_produit: 2, prix: 8, qte: 2, nom: 'Burger' },
            { id_commande: 1, id_pc: 11, id_produit: 3, prix: 3, qte: 1, nom: 'Frites' },
        ];
        const modifications = [
            { id_pc: 11, id_ingredient: 4, modificateur: 1, nom: 'Fromage' },
        ];

        const [commande] = assembleCommandes(commandes, lignes, modifications);

        expect(commande.total).toBe(19);
        expect(commande.produits.map((p) => p.tempId)).toEqual([0, 1]);
        expect(commande.produits[0].modifications).toEqual([]);
        expect(commande.produits[1].modifications).toEqual([modifications[0]]);
    });

    it('keeps an order with no lines and restarts tempId per order', () => {
        const commandes = [
            { id_commande: 1, libelle: 'Vide' },
            { id_commande: 2, libelle: 'Pleine' },
        ];
        const lignes = [
            { id_commande: 2, id_pc: 20, prix: 5, qte: 1 },
        ];

        const assembled = assembleCommandes(commandes, lignes, []);

        expect(assembled[0]).toMatchObject({ total: 0, produits: [] });
        expect(assembled[1].produits[0].tempId).toBe(0);
        expect(assembled[1].total).toBe(5);
    });
});

describe('lecture de commandes', () => {
    beforeEach(() => {
        poolQuery.mockReset();
    });

    it('loads a whole month when the sales PDF sends YYYY-MM', async () => {
        const seen = [];
        poolQuery.mockImplementation((sql, params, cb) => {
            seen.push(params);
            cb(null, []);
        });

        await expect(Commande.getCommandeparDate('2026-09', 3)).resolves.toEqual([]);
        expect(seen[0]).toEqual(['2026-09-01 00:00:00', '2026-10-01 00:00:00', 3]);
    });

    it('rejects cleanly when an order id does not belong to the user', async () => {
        poolQuery.mockImplementation((sql, params, cb) => cb(null, []));

        await expect(Commande.getCommandeParId(9, 3)).rejects.toThrow("Aucune commande correspondant à l'id 9");
        expect(poolQuery).toHaveBeenCalledTimes(1);
    });

    it('includes the last day of the period in monthly statistics', async () => {
        let seen;
        poolQuery.mockImplementation((sql, params, cb) => {
            seen = params;
            cb(null, []);
        });

        await Commande.getStatistiques('2026-09-01', '2026-09-30', 3);
        expect(seen).toEqual(['2026-09-01 00:00:00', '2026-10-01 00:00:00', 3]);
    });
});

describe('écritures de commande', () => {
    const ticket = {
        libelle: 'Midi',
        date_commande: '2026-09-27 12:00:00',
        produits: [{ id_produit: 1, qte: 1, prix: 8, custom: 0 }],
    };

    beforeEach(() => {
        conn.beginTransaction.mockClear();
        conn.commit.mockClear();
        conn.rollback.mockClear();
        conn.release.mockClear();
        conn.query.mockReset();
    });

    it('rolls back the new order when inserting a line fails', async () => {
        failOnQuery(2);

        await expect(Commande.addCommande(ticket, 3)).rejects.toThrow('insert failed');
        expect(conn.rollback).toHaveBeenCalledOnce();
        expect(conn.commit).not.toHaveBeenCalled();
        expect(conn.release).toHaveBeenCalledOnce();
    });

    it('rolls back an update when reinserting lines fails after the delete', async () => {
        failOnQuery(3);

        await expect(Commande.updateCommande(ticket, 9, 3)).rejects.toThrow('insert failed');
        expect(conn.rollback).toHaveBeenCalledOnce();
        expect(conn.commit).not.toHaveBeenCalled();
        expect(conn.release).toHaveBeenCalledOnce();
    });

    it('inserts all modifications of a line in one statement', async () => {
        const sqls = [];
        conn.query.mockImplementation((sql, params, cb) => {
            sqls.push({ sql, params });
            cb(null, { insertId: 42, affectedRows: 1 });
        });

        await Commande.addCommande({
            ...ticket,
            produits: [{
                id_produit: 1,
                qte: 1,
                prix: 9,
                modifications: [
                    { id_ingredient: 4, modificateur: 1 },
                    { id_ingredient: 5, modificateur: -1 },
                ],
            }],
        }, 3);

        const modifInserts = sqls.filter(({ sql }) => sql.includes('INSERT INTO modifications'));
        expect(modifInserts).toHaveLength(1);
        expect(modifInserts[0].params).toEqual([[[42, 4, 1], [42, 5, -1]]]);
        expect(conn.commit).toHaveBeenCalledOnce();
    });
});
