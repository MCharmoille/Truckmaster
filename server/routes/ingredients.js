import express from 'express';
import { getIngredients } from '../controllers/ingredients.js';

const router = express.Router();

router.get('/', getIngredients);

export default router;