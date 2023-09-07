import Produit from '../models/Produit.js';

export const getProduits = async (req, res) => {
    try {
        const produits = await Produit.find();
        res.status(200).json(produits);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}