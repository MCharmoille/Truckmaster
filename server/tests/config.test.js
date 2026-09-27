import { describe, it, expect } from 'vitest';
import { getJwtSecret, getDbConfig } from '../lib/config.js';

describe('getJwtSecret', () => {
    it('throws if JWT_SECRET is missing', () => {
        expect(() => getJwtSecret({})).toThrow(/JWT_SECRET/);
        expect(() => getJwtSecret({ JWT_SECRET: '' })).toThrow(/JWT_SECRET/);
    });

    it('returns the secret when set', () => {
        expect(getJwtSecret({ JWT_SECRET: 'a-real-secret' })).toBe('a-real-secret');
    });
});

describe('getDbConfig', () => {
    it('throws if required vars are missing and does not fall back to production host', () => {
        expect(() => getDbConfig({})).toThrow(/DB_HOST/);
        expect(() => getDbConfig({ DB_USER: 'root', DB_NAME: 'ohtruckdesesse' })).toThrow(/DB_HOST/);
    });

    it('maps env vars without a hardcoded production host', () => {
        const cfg = getDbConfig({
            DB_HOST: 'localhost',
            DB_USER: 'root',
            DB_PASSWORD: '',
            DB_NAME: 'ohtruckdesesse',
        });
        expect(cfg).toEqual({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'ohtruckdesesse',
        });
        expect(cfg.host).not.toBe('37.187.55.12');
    });
});
