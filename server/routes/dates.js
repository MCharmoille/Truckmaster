import express from 'express';
import { getDates, updateCb } from '../controllers/dates.js';

const router = express.Router();

router.get('/', getDates);
router.post('/updateCb', updateCb);

export default router;