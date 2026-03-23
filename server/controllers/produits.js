import Produit from '../models/Produit.js';

const getUserId = (req) => req.headers['x-user-id'] || 1;

export const getProduits = async (req, res) => {
    try {
        const userId = getUserId(req);
        const produits = await Produit.getProduits(userId);
        res.status(200).json(produits);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getProduit = async (req, res) => {
    try {
        const userId = getUserId(req);
        const withStats = req.query.stats === 'true';
        const recette = await Produit.getProduit(req.query.id_produit, userId, withStats);
        res.status(200).json(recette);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getProduitsAffiches = async (req, res) => {
    try {
        const userId = getUserId(req);
        const produits = await Produit.getProduitsAffiches(userId);
        res.status(200).json(produits);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getTypes = async (req, res) => {
    try {
        const types = await Produit.getTypes();
        res.status(200).json(types);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const save = async (req, res) => {
    try {
        const userId = getUserId(req);
        const result = await Produit.save(req.params.id, userId, req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const createProduit = async (req, res) => {
    try {
        const userId = getUserId(req);
        const result = await Produit.create(userId);
        res.status(201).json(result);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}
