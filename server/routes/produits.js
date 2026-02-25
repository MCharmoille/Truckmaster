import express from 'express';
import { getProduits, getProduit, getIngredientsparDate, checkIngredient, stockIngredient, getProduitsAffiches, getTypes, save, createProduit } from '../controllers/produits.js';

const router = express.Router();

router.get('/', getProduits);
router.get('/produit', getProduit);
router.get('/types', getTypes);
router.get('/produitsAffiches', getProduitsAffiches);
router.post('/save/:id', save);
router.post('/create', createProduit);

export default router;