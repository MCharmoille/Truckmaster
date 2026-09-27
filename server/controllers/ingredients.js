import Ingredient from '../models/Ingredient.js';
import { getUserId } from '../middleware/auth.js';
import { customConsoleLog } from '../lib/logger.js';

export const getIngredients = async (req, res) => {
    try {
        const userId = getUserId(req);
        const ingredients = await Ingredient.getIngredients(userId);
        res.status(200).json(ingredients);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const createIngredient = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { nom } = req.body;
        const newIngredient = await Ingredient.create(nom, userId);
        res.status(201).json(newIngredient);
    } catch (error) {
        customConsoleLog("Erreur création ingrédient: " + error.message);
        res.status(400).json({ message: error.message });
    }
}
