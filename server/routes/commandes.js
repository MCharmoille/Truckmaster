import express from 'express';
import { getCommandeparDate, addCommande, paiementCommande, getCommandeParId, updateCommande, getResumeparDate } from '../controllers/commandes.js';

const router = express.Router();

router.get('/date/:date', getCommandeparDate);
router.get('/id/:idCommande', getCommandeParId);
router.get('/resume/:date', getResumeparDate);
router.post('/', addCommande);
router.post('/update/:idCommande', updateCommande);
router.post('/paiement', paiementCommande);

export default router;