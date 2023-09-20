import express from 'express';
import { getCommandes, addCommande, paiementCommande, getCommandeParId, updateCommande } from '../controllers/commandes.js';

const router = express.Router();

router.get('/', getCommandes);
router.get('/:idCommande', getCommandeParId);
router.post('/', addCommande);
router.post('/update/:idCommande', updateCommande);
router.post('/paiement', paiementCommande);

export default router;