import Date from '../models/Date.js';

export const getDates = async (req, res) => {
    try {
        const produits = await Date.getDates();
        res.status(200).json(produits);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const updateCb = async (req, res) => {
    try {
        const ing = await Date.updateCb(req, res);
        res.status(200).json(ing);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}