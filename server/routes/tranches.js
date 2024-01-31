import express from 'express';
import { getTranches, addTranche, deleteTranche } from '../controllers/tranches.js';

const router = express.Router();

router.get('/', getTranches);
router.post('/addTranche', addTranche);
router.post('/deleteTranche', deleteTranche);

export default router;