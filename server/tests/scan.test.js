import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const TEST_SECRET = 'unit-test-jwt-secret';
process.env.JWT_SECRET = TEST_SECRET;

vi.mock('../lib/db.js', () => ({
    db: { query: vi.fn() },
    query: (target, sql, params) => new Promise((resolve, reject) => {
        target.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)));
    }),
    withTransaction: vi.fn(),
}));

vi.mock('axios', () => ({
    default: { post: vi.fn() },
}));

vi.mock('../models/Achat.js', () => ({
    default: {
        getUniqueNames: vi.fn().mockResolvedValue([]),
    },
}));

import { db } from '../lib/db.js';
import axios from 'axios';
import { requireAuth } from '../middleware/auth.js';
import achatsRoutes from '../routes/achats.js';
import { quotaDecision } from '../controllers/ai.js';
import { toSqlDateTime } from '../lib/date.js';

function quotaReachedRow() {
    return [{ ai_usage_monthly: 50, ai_next_reset: '2099-01-01T00:00:00' }];
}

function tokenFor(userId) {
    return jwt.sign({ username: 'tester', userId }, TEST_SECRET, { expiresIn: '7d' });
}

function createApp() {
    const app = express();
    app.use(express.json());
    app.use('/achats', requireAuth, achatsRoutes);
    return app;
}

describe('POST /achats/scan', () => {
    const app = createApp();

    beforeEach(() => {
        db.query.mockReset();
        axios.post.mockReset();
        process.env.GEMINI_API_KEY = 'test-gemini-key';
    });

    it('returns 401 without token', async () => {
        const res = await request(app).post('/achats/scan');
        expect(res.status).toBe(401);
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('returns 400 with token but no file', async () => {
        const res = await request(app)
            .post('/achats/scan')
            .set('Authorization', `Bearer ${tokenFor(3)}`);
        expect(res.status).toBe(400);
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('returns 403 when quota is reached and does not call Gemini', async () => {
        db.query.mockImplementation((sql, params, cb) => {
            cb(null, quotaReachedRow());
        });

        const res = await request(app)
            .post('/achats/scan')
            .set('Authorization', `Bearer ${tokenFor(3)}`)
            .attach('image', Buffer.from('fake-image'), {
                filename: 'ticket.jpg',
                contentType: 'image/jpeg',
            });

        expect(res.status).toBe(403);
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('uses req.userId from the token, not a spoofed x-user-id header', async () => {
        let seenIds = [];
        db.query.mockImplementation((sql, params, cb) => {
            seenIds.push(params[0]);
            cb(null, quotaReachedRow());
        });

        await request(app)
            .post('/achats/scan')
            .set('Authorization', `Bearer ${tokenFor(7)}`)
            .set('x-user-id', '1')
            .attach('image', Buffer.from('fake-image'), {
                filename: 'ticket.jpg',
                contentType: 'image/jpeg',
            });

        expect(seenIds).toContain(7);
        expect(seenIds).not.toContain(1);
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('resets the counter when the renewal date has passed and stores the next one', async () => {
        const row = { ai_usage_monthly: 50, ai_next_reset: '2026-01-15T08:30:00' };
        const updates = [];
        db.query.mockImplementation((sql, params, cb) => {
            if (String(sql).includes('UPDATE')) {
                updates.push(params);
                cb(null, { affectedRows: 1 });
                return;
            }
            cb(null, [row]);
        });
        axios.post.mockResolvedValue({
            data: {
                candidates: [{
                    content: { parts: [{ text: '[{"nom":"Pain","quantite":1,"prix":2}]' }] },
                }],
            },
        });

        const res = await request(app)
            .post('/achats/scan')
            .set('Authorization', `Bearer ${tokenFor(3)}`)
            .attach('image', Buffer.from('fake-image'), {
                filename: 'ticket.jpg',
                contentType: 'image/jpeg',
            });

        expect(res.status).toBe(200);
        expect(axios.post).toHaveBeenCalled();
        const decision = quotaDecision(row);
        expect(updates).toEqual([[1, toSqlDateTime(decision.nextReset), 3]]);
    });

    it('returns 500 when the quota month column is missing and does not call Gemini', async () => {
        db.query.mockImplementation((sql, params, cb) => {
            const err = new Error("Unknown column 'ai_usage_month'");
            err.code = 'ER_BAD_FIELD_ERROR';
            cb(err);
        });

        const res = await request(app)
            .post('/achats/scan')
            .set('Authorization', `Bearer ${tokenFor(3)}`)
            .attach('image', Buffer.from('fake-image'), {
                filename: 'ticket.jpg',
                contentType: 'image/jpeg',
            });

        expect(res.status).toBe(500);
        expect(res.body.message).toMatch(/compteur de scans/);
        expect(axios.post).not.toHaveBeenCalled();
    });
});
