import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/db.js', () => ({
    db: { query: vi.fn() },
}));

import { db } from '../lib/db.js';
import Utilisateur, { sanitizeUser } from '../models/Utilisateur.js';

describe('sanitizeUser', () => {
    it('removes motdepasse from a user row', () => {
        expect(sanitizeUser({ id: 1, nom: 'Max', motdepasse: '$2b$10$hash' })).toEqual({
            id: 1,
            nom: 'Max',
        });
    });

    it('returns falsy rows as-is', () => {
        expect(sanitizeUser(undefined)).toBeUndefined();
        expect(sanitizeUser(null)).toBeNull();
    });
});

describe('Utilisateur.getById', () => {
    beforeEach(() => {
        db.query.mockReset();
    });

    it('does not SELECT motdepasse and sanitizes the result', async () => {
        db.query.mockImplementation((sql, params, cb) => {
            expect(sql.toLowerCase()).not.toContain('motdepasse');
            expect(sql).not.toMatch(/SELECT\s+\*/i);
            expect(params).toEqual([7]);
            cb(null, [{ id: 7, nom: 'Max', motdepasse: 'should-be-stripped' }]);
        });

        const user = await Utilisateur.getById(7);
        expect(user.motdepasse).toBeUndefined();
        expect(user.id).toBe(7);
        expect(user.nom).toBe('Max');
    });
});
