import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('mysql2', () => ({
    default: {
        createPool: () => ({
            on: vi.fn(),
            getConnection: vi.fn(),
        }),
    },
}));

vi.mock('../lib/config.js', () => ({
    getDbConfig: () => ({ host: 'localhost', user: 'root', password: '', database: 'test' }),
}));

import { withTransaction } from '../lib/db.js';

describe('withTransaction', () => {
    let conn;
    let pool;

    beforeEach(() => {
        conn = {
            beginTransaction: vi.fn((cb) => cb(null)),
            commit: vi.fn((cb) => cb(null)),
            rollback: vi.fn((cb) => cb(null)),
            release: vi.fn(),
        };
        pool = {
            getConnection: vi.fn((cb) => cb(null, conn)),
        };
    });

    it('commits and releases the connection when the work succeeds', async () => {
        await expect(withTransaction(async () => 'ok', pool)).resolves.toBe('ok');
        expect(conn.commit).toHaveBeenCalledOnce();
        expect(conn.rollback).not.toHaveBeenCalled();
        expect(conn.release).toHaveBeenCalledOnce();
    });

    it('rolls back and does not commit when the work throws', async () => {
        await expect(withTransaction(async () => {
            throw new Error('fail');
        }, pool)).rejects.toThrow('fail');
        expect(conn.rollback).toHaveBeenCalledOnce();
        expect(conn.commit).not.toHaveBeenCalled();
        expect(conn.release).toHaveBeenCalledOnce();
    });
});
