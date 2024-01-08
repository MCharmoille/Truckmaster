import Utilisateur from '../models/Utilisateur.js';

export const login = async (req, res) => {
    try {
        const result = await Utilisateur.login(req, res);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}