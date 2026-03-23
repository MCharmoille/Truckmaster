import Commande from '../models/Commande.js';

const getUserId = (req) => req.headers['x-user-id'] || 1;

export const getCommandeparDate = async (req, res) => {
    try {
        const userId = getUserId(req);
        const commandes = await Commande.getCommandeparDate(req.params.date, userId);
        res.status(200).json(commandes);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getCommandeParId = async (req, res) => {
    try {
        const userId = getUserId(req);
        const commandes = await Commande.getCommandeParId(req.params.idCommande, userId);
        res.status(200).json(commandes);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getResumeparDate = async (req, res) => {
    try {
        const userId = getUserId(req);
        const commandes = await Commande.getResumeparDate(req.params.date, userId);
        res.status(200).json(commandes);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const addCommande = async (req, res) => {
    try {
        const userId = getUserId(req);
        const commande = await Commande.addCommande(req.body, userId);
        res.status(200).json(commande);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const updateCommande = async (req, res) => {
    try {
        const userId = getUserId(req);
        const commande = await Commande.updateCommande(req.body, req.params.idCommande, userId);
        res.status(200).json(commande);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const supprimerCommande = async (req, res) => {
    try {
        const userId = getUserId(req);
        const commande = await Commande.supprimerCommande(req.params.idCommande, userId);
        res.status(200).json(commande);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const paiementCommande = async (req, res) => {
    try {
        const userId = getUserId(req);
        const commande = await Commande.paiementCommande(req.body, userId);
        res.status(200).json(commande);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getStatistiques = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { startDate, endDate } = req.query;
        const result = await Commande.getStatistiques(startDate, endDate, userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}
