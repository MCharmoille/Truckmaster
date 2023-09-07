import express from 'express';
import { getCommandes, addCommande } from '../controllers/commandes.js';

const router = express.Router();

router.get('/', getCommandes);
router.post('/', addCommande);

export default router;