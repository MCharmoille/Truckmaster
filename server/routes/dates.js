import express from 'express';
import { getDates } from '../controllers/dates.js';

const router = express.Router();

router.get('/', getDates);

export default router;