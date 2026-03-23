import Date from '../models/Date.js';

const getUserId = (req) => req.headers['x-user-id'] || 1;

export const getDates = async (req, res) => {
    try {
        const userId = getUserId(req);
        const dates = await Date.getDates(userId);
        res.status(200).json(dates);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getDate = async (req, res) => {
    try {
        const userId = getUserId(req);
        const dates = await Date.getDate(req.params.date, userId);
        res.status(200).json(dates);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const addDate = async (req, res) => {
    try {
        const userId = getUserId(req);
        const date = await Date.addDate(req.body, userId);
        res.status(200).json(date);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const updateCb = async (req, res) => {
    try {
        const userId = getUserId(req);
        const result = await Date.updateCb(req.body, userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const deleteDate = async (req, res) => {
    try {
        const userId = getUserId(req);
        const date = await Date.deleteDate(req.body, userId);
        res.status(200).json(date);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}