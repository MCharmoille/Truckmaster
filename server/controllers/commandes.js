import Commande from '../models/Commande.js';

export const getCommandes = async (req, res) => {
    try {
        console.log("demande recu par le controller");
        const commandes = await Commande.find();
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