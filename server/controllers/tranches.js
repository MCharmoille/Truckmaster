import Tranche from '../models/Tranche.js';

const getUserId = (req) => req.headers['x-user-id'] || 1;

export const getTranches = async (req, res) => {
    try {
        const userId = getUserId(req);
        const tranches = await Tranche.getTranches(userId);
        res.status(200).json(tranches);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const addTranche = async (req, res) => {
    try {
        const userId = getUserId(req);
        const tranche = await Tranche.addTranche(req.body, userId);
        res.status(200).json(tranche);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const deleteTranche = async (req, res) => {
    try {
        const userId = getUserId(req);
        const tranche = await Tranche.deleteTranche(req.body, userId);
        res.status(200).json(tranche);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}