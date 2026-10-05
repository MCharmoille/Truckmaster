const pad = (n) => String(n).padStart(2, '0');

function calendarDate(year, month, day) {
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        throw new Error('Date invalide');
    }
    return date;
}

function sqlMidnight(date) {
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} 00:00:00`;
}

export function dayRange(day) {
    if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
        throw new Error('Date invalide');
    }
    const [year, month, d] = day.split('-').map(Number);
    const start = calendarDate(year, month, d);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return [sqlMidnight(start), sqlMidnight(end)];
}

export function monthRange(month) {
    if (typeof month !== 'string' || !/^\d{4}-\d{2}$/.test(month)) {
        throw new Error('Date invalide');
    }
    const [year, m] = month.split('-').map(Number);
    const start = calendarDate(year, m, 1);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);
    return [sqlMidnight(start), sqlMidnight(end)];
}

export function periodRange(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}$/.test(value)
        ? monthRange(value)
        : dayRange(value);
}

export function addMonths(date, months) {
    const next = new Date(date.getTime());
    const day = date.getDate();
    next.setDate(1);
    next.setMonth(next.getMonth() + months);
    const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(day, lastDay));
    return next;
}

export function nextMonthlyOccurrence(anchor, now) {
    let step = 1;
    let next = addMonths(anchor, step);
    while (next <= now) {
        step += 1;
        next = addMonths(anchor, step);
    }
    return next;
}

export function parseDateTime(value) {
    if (!value) return null;
    const date = value instanceof Date
        ? new Date(value.getTime())
        : new Date(String(value).replace(' ', 'T'));
    return Number.isNaN(date.getTime()) ? null : date;
}

export function toSqlDateTime(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function toFrenchDate(date) {
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}
