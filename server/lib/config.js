export function getJwtSecret(env = process.env) {
    const secret = env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET est requis. Définissez-le dans le fichier .env (voir .env.example).');
    }
    return secret;
}

export function getDbConfig(env = process.env) {
    const host = env.DB_HOST;
    const user = env.DB_USER;
    const database = env.DB_NAME;
    if (!host || !user || !database) {
        throw new Error('DB_HOST, DB_USER et DB_NAME sont requis. Définissez-les dans le fichier .env (voir .env.example).');
    }
    return {
        host,
        user,
        password: env.DB_PASSWORD ?? '',
        database,
    };
}
