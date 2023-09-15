import express from 'express';
import { getCommandes, addCommande, paiementCommande } from '../controllers/commandes.js';

const router = express.Router();

router.get('/', getCommandes);
router.post('/', addCommande);
router.post('/paiement', paiementCommande);

export default router;