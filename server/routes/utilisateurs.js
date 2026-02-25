import express from 'express';
import { login, getUser, updateUser, uploadLogo } from '../controllers/utilisateurs.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer config for logo upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.post('/login', login);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.post('/:id/logo', upload.single('logo'), uploadLogo);

export default router;