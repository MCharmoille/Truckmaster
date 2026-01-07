import express from 'express';
import { getIngredients, createIngredient } from '../controllers/ingredients.js';

const router = express.Router();

router.get('/', getIngredients);
router.post('/', createIngredient);

export default router;