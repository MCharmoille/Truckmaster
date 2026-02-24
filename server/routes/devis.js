import express from 'express';
import { getDevis, getDevisById, createDevis, updateDevis, deleteDevis } from '../controllers/devis.js';

const router = express.Router();

router.get('/', getDevis);
router.get('/:id', getDevisById);
router.post('/', createDevis);
router.put('/:id', updateDevis);
router.delete('/:id', deleteDevis);

export default router;
