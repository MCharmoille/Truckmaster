import express from 'express';
import { login, getUser, updateUser, uploadLogo } from '../controllers/utilisateurs.js';
import { requireAuth, requireSelf } from '../middleware/auth.js';
import { createLogoUpload, handleMulterError } from '../middleware/upload.js';

const router = express.Router();
const upload = createLogoUpload();

router.post('/login', login);
router.use(requireAuth);
router.get('/:id', requireSelf, getUser);
router.put('/:id', requireSelf, updateUser);
router.post('/:id/logo', requireSelf, upload.single('logo'), handleMulterError, uploadLogo);

export default router;
