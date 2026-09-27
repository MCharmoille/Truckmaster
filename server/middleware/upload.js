import multer from 'multer';

export const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const MIME_TO_EXT = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
};

export function imageFileFilter(req, file, cb) {
    if (ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
        cb(null, true);
        return;
    }
    cb(new Error('Type de fichier non autorisé'));
}

export function logoFilename(req, file, cb) {
    const ext = MIME_TO_EXT[file.mimetype] || '.jpg';
    const userId = String(req.userId ?? 'unknown').replace(/[^0-9a-zA-Z_-]/g, '');
    const name = `logo-${userId}-${Date.now()}${ext}`;
    if (name.includes('..') || name.includes('/') || name.includes('\\')) {
        cb(new Error('Nom de fichier invalide'));
        return;
    }
    cb(null, name);
}

export function createLogoUpload() {
    return multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => cb(null, 'uploads/'),
            filename: logoFilename,
        }),
        limits: { fileSize: 2 * 1024 * 1024 },
        fileFilter: imageFileFilter,
    });
}

export function createScanUpload() {
    return multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: imageFileFilter,
    });
}

export function handleMulterError(err, req, res, next) {
    if (!err) {
        return next();
    }
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'Fichier trop volumineux' });
        }
        return res.status(400).json({ message: err.message });
    }
    if (err.message === 'Type de fichier non autorisé' || err.message === 'Nom de fichier invalide') {
        return res.status(400).json({ message: err.message });
    }
    return next(err);
}
