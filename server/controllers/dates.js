import Date from '../models/Date.js';

export const getDates = async (req, res) => {
    try {
        const dates = await Date.getDates();
        res.status(200).json(dates);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getDate = async (req, res) => {
    try {
        const dates = await Date.getDate(req.params.date);
        res.status(200).json(dates);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const addDate = async (req, res) => {
    try {
        const date = await Date.addDate(req, res);
        res.status(200).json(date);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const updateCb = async (req, res) => {
    try {
        const ing = await Date.updateCb(req, res);
        res.status(200).json(ing);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const deleteDate = async (req, res) => {
    try {
        const date = await Date.deleteDate(req, res);
        res.status(200).json(date);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}