import express from 'express';
import { getAchats, createAchat, updateAchat, deleteAchat, getStatistiquesAchats, createFacture } from '../controllers/achats.js';
import { scanReceipt } from '../controllers/ai.js';
import { createScanUpload, handleMulterError } from '../middleware/upload.js';

const upload = createScanUpload();

const router = express.Router();

router.get('/', getAchats);
router.post('/', createAchat);
router.post('/factures', createFacture);
router.put('/:id', updateAchat);
router.delete('/:id', deleteAchat);
router.get('/statistiques', getStatistiquesAchats);
router.post('/scan', upload.single('image'), handleMulterError, scanReceipt);

export default router;
