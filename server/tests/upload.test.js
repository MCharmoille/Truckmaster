import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { imageFileFilter, logoFilename, createScanUpload, handleMulterError } from '../middleware/upload.js';

describe('imageFileFilter', () => {
    it('accepts jpeg and png', () => {
        for (const mimetype of ['image/jpeg', 'image/png']) {
            const cb = vi.fn();
            imageFileFilter({}, { mimetype }, cb);
            expect(cb).toHaveBeenCalledWith(null, true);
        }
    });

    it('rejects javascript, html and svg', () => {
        for (const mimetype of ['application/javascript', 'text/html', 'image/svg+xml']) {
            const cb = vi.fn();
            imageFileFilter({}, { mimetype }, cb);
            expect(cb).toHaveBeenCalledTimes(1);
            const [err, ok] = cb.mock.calls[0];
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toBe('Type de fichier non autorisé');
            expect(ok).toBeUndefined();
        }
    });
});

describe('logoFilename', () => {
    it('derives extension from MIME and ignores originalname path traversal', () => {
        const file = { mimetype: 'image/jpeg', originalname: '../../evil.exe.jpg' };
        const req = { userId: 12 };
        logoFilename(req, file, (err, name) => {
            expect(err).toBeNull();
            expect(name).toMatch(/^logo-12-\d+\.jpg$/);
            expect(name).not.toContain('..');
            expect(name).not.toContain('/');
            expect(name).not.toContain('\\');
            expect(name).not.toContain('evil');
        });
    });
});

describe('scan upload size limit', () => {
    const app = express();
    app.post('/scan', createScanUpload().single('image'), handleMulterError, (req, res) => {
        res.status(200).json({ ok: true });
    });

    it('returns 400 LIMIT_FILE_SIZE over 5MB', async () => {
        const res = await request(app)
            .post('/scan')
            .attach('image', Buffer.alloc(5 * 1024 * 1024 + 1), {
                filename: 'big.jpg',
                contentType: 'image/jpeg',
            });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Fichier trop volumineux');
    });
});
