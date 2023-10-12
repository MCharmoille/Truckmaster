import Date from '../models/Date.js';

export const getDates = async (req, res) => {
    try {
        const produits = await Date.getDates();
        res.status(200).json(produits);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}
