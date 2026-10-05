import { describe, it, expect, vi } from 'vitest';

vi.mock('../lib/db.js', () => ({
    db: { query: vi.fn() },
    query: vi.fn(),
    withTransaction: vi.fn(),
}));

vi.mock('../models/Achat.js', () => ({
    default: { getUniqueNames: vi.fn() },
}));

vi.mock('axios', () => ({
    default: { post: vi.fn() },
}));

import { quotaDecision } from '../controllers/ai.js';
import { addMonths } from '../lib/date.js';

describe('quotaDecision', () => {
    const now = new Date('2026-09-28T12:00:00');

    it('blocks when the reset date is still in the future and the counter is at 50', () => {
        const decision = quotaDecision({
            ai_usage_monthly: 50,
            ai_next_reset: '2026-10-15T00:00:00',
        }, now);

        expect(decision.blocked).toBe(true);
        expect(decision.due).toBe(false);
        expect(decision.count).toBe(50);
        expect(decision.nextReset).toEqual(new Date('2026-10-15T00:00:00'));
    });

    it('resets a past date and keeps the chosen day of the month', () => {
        const decision = quotaDecision({
            ai_usage_monthly: 50,
            ai_next_reset: '2026-01-15T08:30:00',
        }, now);

        expect(decision.blocked).toBe(false);
        expect(decision.due).toBe(true);
        expect(decision.count).toBe(0);
        expect(decision.nextReset).toEqual(new Date('2026-10-15T08:30:00'));
    });

    it('accepts the Date object returned by mysql2', () => {
        const decision = quotaDecision({
            ai_usage_monthly: 12,
            ai_next_reset: new Date('2026-10-15T00:00:00'),
        }, now);
        expect(decision.count).toBe(12);
        expect(decision.blocked).toBe(false);
    });

    it('starts one month from now when no reset date is stored', () => {
        const decision = quotaDecision({ ai_usage_monthly: 50, ai_next_reset: null }, now);
        expect(decision.blocked).toBe(false);
        expect(decision.count).toBe(0);
        expect(decision.nextReset).toEqual(addMonths(now, 1));
    });
});
