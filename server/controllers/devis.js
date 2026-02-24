import Devis from '../models/Devis.js';

export const getDevis = async (req, res) => {
    try {
        const devis = await Devis.getAll();
        res.status(200).json(devis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDevisById = async (req, res) => {
    try {
        const devis = await Devis.getById(req.params.id);
        if (devis) {
            res.status(200).json(devis);
        } else {
            res.status(404).json({ message: "Devis introuvable" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createDevis = async (req, res) => {
    try {
        const result = await Devis.create(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateDevis = async (req, res) => {
    try {
        await Devis.update(req.params.id, req.body);
        res.status(200).json({ message: "Devis mis à jour" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteDevis = async (req, res) => {
    try {
        await Devis.delete(req.params.id);
        res.status(200).json({ message: "Devis supprimé" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
