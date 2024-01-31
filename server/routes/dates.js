import express from 'express';
import { getDates, updateCb, addDate, deleteDate, getDate } from '../controllers/dates.js';

const router = express.Router();

router.get('/', getDates);
router.get('/id/:date', getDate);
router.post('/updateCb', updateCb);
router.post('/addDate', addDate);
router.post('/deleteDate', deleteDate);

export default router;