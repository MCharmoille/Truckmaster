import Commande from '../models/Commande.js';

export const getCommandeparDate = async (req, res) => {
    try {
        const commandes = await Commande.getCommandeparDate(req.params.date);
        res.status(200).json(commandes);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getCommandeParId = async (req, res) => {
    try {
        const commandes = await Commande.getCommandeParId(req.params.idCommande);
        res.status(200).json(commandes);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getResumeparDate = async (req, res) => {
    try {
        const commandes = await Commande.getResumeparDate(req.params.date);
        res.status(200).json(commandes);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const addCommande = async (req, res) => {
    try {
        const commande = await Commande.addCommande(req, res);
        res.status(200).json(commande);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const updateCommande = async (req, res) => {
    try {
        const commande = await Commande.updateCommande(req, res, req.params.idCommande);
        res.status(200).json(commande);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const paiementCommande = async (req, res) => {
    try {
        const commande = await Commande.paiementCommande(req, res);
        res.status(200).json(commande);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}
