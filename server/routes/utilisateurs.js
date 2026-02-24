import express from 'express';
import { login, getUser } from '../controllers/utilisateurs.js';

const router = express.Router();

router.post('/login', login);
router.get('/:id', getUser);

export default router;