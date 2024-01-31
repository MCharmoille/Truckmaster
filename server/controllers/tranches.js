import Tranche from '../models/Tranche.js';

export const getTranches = async (req, res) => {
    try {
        const tranches = await Tranche.getTranches();
        res.status(200).json(tranches);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const addTranche = async (req, res) => {
    try {
        const tranche = await Tranche.addTranche(req, res);
        res.status(200).json(tranche);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const deleteTranche = async (req, res) => {
    try {
        const tranche = await Tranche.deleteTranche(req, res);
        res.status(200).json(tranche);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}