import express from 'express';
import { getProduits } from '../controllers/produits.js';

const router = express.Router();

router.get('/', getProduits);

export default router;