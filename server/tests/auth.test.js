import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { requireAuth, requireSelf, signUserToken } from '../middleware/auth.js';

const TEST_SECRET = 'unit-test-jwt-secret';
process.env.JWT_SECRET = TEST_SECRET;

function createAuthApp() {
    const app = express();
    app.get('/protected', requireAuth, (req, res) => {
        res.json({ userId: req.userId, username: req.username });
    });
    app.get('/utilisateurs/:id', requireAuth, requireSelf, (req, res) => {
        res.json({ userId: req.userId });
    });
    return app;
}

describe('requireAuth', () => {
    const app = createAuthApp();

    it('returns 401 without Authorization header', async () => {
        const res = await request(app).get('/protected');
        expect(res.status).toBe(401);
    });

    it('returns 401 with invalid bearer token', async () => {
        const res = await request(app)
            .get('/protected')
            .set('Authorization', 'Bearer not-a-jwt');
        expect(res.status).toBe(401);
    });

    it('returns 401 when token is signed with the wrong secret', async () => {
        const token = jwt.sign({ username: 'a', userId: 1 }, 'wrong-secret', { expiresIn: '7d' });
        const res = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(401);
    });

    it('returns 401 when token is expired', async () => {
        const token = jwt.sign({ username: 'a', userId: 1 }, TEST_SECRET, { expiresIn: -10 });
        const res = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(401);
    });

    it('sets req.userId and calls next for a valid token', async () => {
        const token = signUserToken({ username: 'Maxime', userId: 42 });
        const res = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ userId: 42, username: 'Maxime' });
    });
});

describe('requireSelf IDOR', () => {
    const app = createAuthApp();

    it('returns 403 when token user A requests /utilisateurs/B', async () => {
        const token = signUserToken({ username: 'A', userId: 1 });
        const res = await request(app)
            .get('/utilisateurs/2')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(403);
    });

    it('allows user A to access /utilisateurs/A', async () => {
        const token = signUserToken({ username: 'A', userId: 1 });
        const res = await request(app)
            .get('/utilisateurs/1')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.userId).toBe(1);
    });
});
