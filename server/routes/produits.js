import express from 'express';
import { getProduits, get_recette, getIngredientsparDate, checkIngredient, stockIngredient, getProduitsAffiches } from '../controllers/produits.js';

const router = express.Router();

router.get('/', getProduits);
router.get('/recette', get_recette);
router.get('/produitsAffiches/:id_type', getProduitsAffiches);
router.get('/ingredients/:date', getIngredientsparDate);
router.post('/ingredients/check', checkIngredient);
router.post('/ingredients/stock', stockIngredient);

export default router;