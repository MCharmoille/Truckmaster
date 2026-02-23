import express from 'express';
import multer from 'multer';
import { getAchats, createAchat, updateAchat, deleteAchat, getStatistiquesAchats } from '../controllers/achats.js';
import { scanReceipt } from '../controllers/ai.js';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get('/', getAchats);
router.post('/', createAchat);
router.put('/:id', updateAchat);
router.delete('/:id', deleteAchat);
router.get('/statistiques', getStatistiquesAchats);
router.post('/scan', upload.single('image'), scanReceipt);

export default router;
