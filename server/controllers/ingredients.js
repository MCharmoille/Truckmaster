import Ingredient from '../models/Ingredient.js';

export const getIngredients = async (req, res) => {
    try {
        const ingredients = await Ingredient.getIngredients();
        res.status(200).json(ingredients);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}