import { hashPassword } from '../lib/password.js';

const password = process.argv[2];

if (!password) {
    console.log('Usage: node scripts/hash-password.js <mot-de-passe>');
    process.exit(1);
}

try {
    const hash = await hashPassword(password);
    console.log('-----------------------------------------');
    console.log('Hashed Password:', hash);
    console.log('-----------------------------------------');
    console.log("\nÀ coller dans la colonne motdepasse de la table utilisateurs.");
} catch (err) {
    console.error('Erreur lors du hash :', err.message);
    process.exit(1);
}
