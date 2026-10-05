import { describe, it, expect, vi, beforeEach } from 'vitest';

const { conn, getConnection } = vi.hoisted(() => {
    const conn = {
        beginTransaction: vi.fn((cb) => cb(null)),
        commit: vi.fn((cb) => cb(null)),
        rollback: vi.fn((cb) => cb(null)),
        release: vi.fn(),
        query: vi.fn(),
    };
    const getConnection = vi.fn((cb) => cb(null, conn));
    return { conn, getConnection };
});

vi.mock('../lib/db.js', () => ({
    db: { getConnection, query: vi.fn() },
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

import Devis from '../models/Devis.js';
import Produit from '../models/Produit.js';

function resetConn() {
    conn.beginTransaction.mockClear();
    conn.commit.mockClear();
    conn.rollback.mockClear();
    conn.release.mockClear();
    conn.query.mockReset();
}

describe('Devis.create', () => {
    beforeEach(resetConn);

    it('rolls back the quote header when its lines cannot be inserted', async () => {
        conn.query.mockImplementation((sql, params, cb) => {
            if (sql.includes('MAX(id_public)')) return cb(null, [{ nextId: 7 }]);
            if (sql.includes('INSERT INTO devis_produits')) return cb(new Error('lines failed'));
            cb(null, { insertId: 55 });
        });

        await expect(Devis.create({
            nom: 'Mariage',
            date_commande: '2026-10-01',
            produits: [{ id_produit: 1, quantite: 10, prix: 8 }],
        }, 3)).rejects.toThrow('lines failed');

        expect(conn.rollback).toHaveBeenCalledOnce();
        expect(conn.commit).not.toHaveBeenCalled();
    });

    it('locks the numbering row while choosing the next public number', async () => {
        const sqls = [];
        conn.query.mockImplementation((sql, params, cb) => {
            sqls.push(sql);
            if (sql.includes('MAX(id_public)')) return cb(null, [{ nextId: 7 }]);
            cb(null, { insertId: 55 });
        });

        await expect(Devis.create({ nom: 'A', produits: [] }, 3)).resolves.toEqual({ id: 55 });
        expect(sqls[0]).toMatch(/FOR UPDATE/);
        expect(conn.commit).toHaveBeenCalledOnce();
    });
});

describe('Produit.save', () => {
    beforeEach(resetConn);

    it('does not mutate the request body', async () => {
        conn.query.mockImplementation((sql, params, cb) => cb(null, { affectedRows: 1 }));
        const body = { nom: 'Burger', recette: [] };

        await Produit.save(4, 3, body);

        expect(body).toEqual({ nom: 'Burger', recette: [] });
    });

    it('checks ownership instead of sending an empty UPDATE when only the recipe changes', async () => {
        const sqls = [];
        conn.query.mockImplementation((sql, params, cb) => {
            sqls.push(sql);
            if (sql.startsWith('SELECT')) return cb(null, [{ id_produit: 4 }]);
            cb(null, { affectedRows: 1 });
        });

        await Produit.save(4, 3, { recette: [{ id_ingredient: 2, qte: 1 }] });

        expect(sqls[0]).toMatch(/^SELECT id_produit FROM produits/);
        expect(sqls.some((sql) => sql.startsWith('UPDATE'))).toBe(false);
        expect(conn.commit).toHaveBeenCalledOnce();
    });

    it('rolls back when the product belongs to another user', async () => {
        conn.query.mockImplementation((sql, params, cb) => cb(null, { affectedRows: 0 }));

        await expect(Produit.save(4, 3, { nom: 'X' })).rejects.toThrow('Produit introuvable ou non autorisé');
        expect(conn.rollback).toHaveBeenCalledOnce();
    });
});
