import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const TEST_SECRET = 'unit-test-jwt-secret';
process.env.JWT_SECRET = TEST_SECRET;

vi.mock('../lib/db.js', () => ({
    db: { query: vi.fn() },
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
            cb(null, [{ ai_usage_monthly: 50 }]);
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
            cb(null, [{ ai_usage_monthly: 50 }]);
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
});
