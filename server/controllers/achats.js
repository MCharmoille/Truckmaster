import Achat from '../models/Achat.js';

export const getAchats = async (req, res) => {
    try {
        const achats = await Achat.getAchats(req.query);
        res.status(200).json(achats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createAchat = async (req, res) => {
    try {
        const achat = await Achat.create(req.body);
        res.status(201).json(achat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAchat = async (req, res) => {
    try {
        const { id } = req.params;
        await Achat.update(id, req.body);
        res.status(200).json({ id_achat: id, ...req.body });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAchat = async (req, res) => {
    try {
        const { id } = req.params;
        await Achat.delete(id);
        res.status(200).json({ message: "Achat supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getStatistiquesAchats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const stats = await Achat.getStatistiques(startDate, endDate);
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
