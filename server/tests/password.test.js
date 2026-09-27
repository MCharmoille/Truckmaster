import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../lib/password.js';

describe('password', () => {
    it('hashes a password and verifies the same plaintext', async () => {
        const hash = await hashPassword('secret-test');
        expect(hash).not.toBe('secret-test');
        expect(await verifyPassword('secret-test', hash)).toBe(true);
        expect(await verifyPassword('wrong', hash)).toBe(false);
    });
});
