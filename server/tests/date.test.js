import { describe, it, expect } from 'vitest';
import {
    addMonths,
    dayRange,
    monthRange,
    nextMonthlyOccurrence,
    periodRange,
    toFrenchDate,
    toSqlDateTime,
} from '../lib/date.js';

describe('dayRange', () => {
    it('returns the start of the day and the start of the next day', () => {
        expect(dayRange('2026-09-27')).toEqual([
            '2026-09-27 00:00:00',
            '2026-09-28 00:00:00',
        ]);
    });

    it('crosses the year boundary', () => {
        expect(dayRange('2026-12-31')).toEqual([
            '2026-12-31 00:00:00',
            '2027-01-01 00:00:00',
        ]);
    });

    it('rejects a date that is not a real calendar day', () => {
        expect(() => dayRange('2026-02-29')).toThrow('Date invalide');
        expect(() => dayRange('2026-09-27; DROP TABLE commandes')).toThrow('Date invalide');
        expect(() => dayRange('27/09/2026')).toThrow('Date invalide');
    });
});

describe('monthRange / periodRange', () => {
    it('covers a whole month, last day included', () => {
        expect(monthRange('2026-09')).toEqual([
            '2026-09-01 00:00:00',
            '2026-10-01 00:00:00',
        ]);
        expect(monthRange('2026-12')[1]).toBe('2027-01-01 00:00:00');
    });

    it('accepts a day or a month, like the sales PDF request', () => {
        expect(periodRange('2026-09')).toEqual(monthRange('2026-09'));
        expect(periodRange('2026-09-27')).toEqual(dayRange('2026-09-27'));
        expect(() => periodRange('2026-13')).toThrow('Date invalide');
    });
});

describe('addMonths / nextMonthlyOccurrence', () => {
    it('clamps a 31st to the last day of a short month, then restores it', () => {
        const january = new Date('2026-01-31T00:00:00');
        expect(addMonths(january, 1)).toEqual(new Date('2026-02-28T00:00:00'));
        expect(nextMonthlyOccurrence(january, new Date('2026-03-01T00:00:00')))
            .toEqual(new Date('2026-03-31T00:00:00'));
    });

    it('skips several missed months and keeps the time of day', () => {
        const anchor = new Date('2026-01-15T08:30:00');
        expect(nextMonthlyOccurrence(anchor, new Date('2026-09-28T12:00:00')))
            .toEqual(new Date('2026-10-15T08:30:00'));
    });
});

describe('formatting', () => {
    it('formats for SQL and for French messages', () => {
        const date = new Date('2026-10-05T07:04:03');
        expect(toSqlDateTime(date)).toBe('2026-10-05 07:04:03');
        expect(toFrenchDate(date)).toBe('05/10/2026');
    });
});
