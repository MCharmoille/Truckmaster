import Produit from '../models/Produit.js';

export const getProduits = async (req, res) => {
    try {
        const produits = await Produit.getProduits();
        res.status(200).json(produits);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getProduit = async (req, res) => {
    try {
        const recette = await Produit.getProduit(req.query.id_produit);
        res.status(200).json(recette);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getProduitsAffiches = async (req, res) => {
    try {
        const produits = await Produit.getProduitsAffiches();
        res.status(200).json(produits);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getIngredientsparDate = async (req, res) => {
    try {
        const ingredients = await Produit.getIngredientsparDate(req.params.date);
        res.status(200).json(ingredients);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const checkIngredient = async (req, res) => {
    try {
        const ing = await Produit.checkIngredient(req, res);
        res.status(200).json(ing);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const stockIngredient = async (req, res) => {
    try {
        const ing = await Produit.stockIngredient(req, res);
        res.status(200).json(ing);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const save = async (req, res) => {
    try {
        const ing = await Produit.save(req.params.id, req.body);
        res.status(200).json(ing);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}