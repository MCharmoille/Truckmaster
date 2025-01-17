import express from 'express';
import { getProduits, getProduit, getIngredientsparDate, checkIngredient, stockIngredient, getProduitsAffiches, save } from '../controllers/produits.js';

const router = express.Router();

router.get('/', getProduits);
router.get('/produit', getProduit);
router.get('/produitsAffiches', getProduitsAffiches);
router.get('/ingredients/:date', getIngredientsparDate);
router.post('/ingredients/check', checkIngredient);
router.post('/ingredients/stock', stockIngredient);
router.post('/save/:id', save);

export default router;