import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../lib/config.js';

export function signUserToken({ username, userId }) {
    return jwt.sign({ username, userId }, getJwtSecret(), { expiresIn: '7d' });
}

export function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Non authentifié' });
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
        return res.status(401).json({ message: 'Non authentifié' });
    }

    try {
        const payload = jwt.verify(token, getJwtSecret());
        req.userId = payload.userId;
        req.username = payload.username;
        return next();
    } catch {
        return res.status(401).json({ message: 'Token invalide ou expiré' });
    }
}

export function requireSelf(req, res, next) {
    const paramId = Number(req.params.id);
    const tokenId = Number(req.userId);
    if (!Number.isFinite(paramId) || !Number.isFinite(tokenId) || paramId !== tokenId) {
        return res.status(403).json({ message: 'Accès interdit' });
    }
    return next();
}

export function getUserId(req) {
    return req.userId;
}
