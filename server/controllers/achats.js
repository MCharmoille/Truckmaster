import Achat from '../models/Achat.js';
import FactureAchat from '../models/FactureAchat.js';

const getUserId = (req) => req.headers['x-user-id'] || 1;

export const getAchats = async (req, res) => {
    try {
        const userId = getUserId(req);
        const achats = await Achat.getAchats(req.query, userId);
        res.status(200).json(achats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createFacture = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { date, items } = req.body;

        // 1. Get next id_public
        const nextIdPublic = await FactureAchat.getNextIdPublic(userId);

        // 2. Create the facture
        const facture = await FactureAchat.create({ date, id_public: nextIdPublic }, userId);
        const id_facture = facture.id;

        // 3. Create all associated items
        const createdItems = await Promise.all(items.map(item => 
            Achat.create({ ...item, date_achat: date, id_facture }, userId)
        ));

        res.status(201).json({ facture, items: createdItems });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createAchat = async (req, res) => {
    try {
        const userId = getUserId(req);
        const achat = await Achat.create(req.body, userId);
        res.status(201).json(achat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAchat = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { id } = req.params;
        await Achat.update(id, req.body, userId);
        res.status(200).json({ id_achat: id, ...req.body });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAchat = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { id } = req.params;
        await Achat.delete(id, userId);
        res.status(200).json({ message: "Achat supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getStatistiquesAchats = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { startDate, endDate } = req.query;
        const stats = await Achat.getStatistiques(startDate, endDate, userId);
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUniqueNames = async (req, res) => {
    try {
        const userId = getUserId(req);
        const names = await Achat.getUniqueNames(userId);
        res.status(200).json(names);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
