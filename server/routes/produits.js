import express from 'express';
import { getProduits, get_recette } from '../controllers/produits.js';

const router = express.Router();

router.get('/', getProduits);
router.get('/recette', get_recette);

export default router;