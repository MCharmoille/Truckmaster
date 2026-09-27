import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export function hashPassword(plain, saltRounds = SALT_ROUNDS) {
    return bcrypt.hash(plain, saltRounds);
}

export function verifyPassword(plain, hash) {
    return bcrypt.compare(plain, hash);
}
