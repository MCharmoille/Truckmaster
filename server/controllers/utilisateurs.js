import Utilisateur from '../models/Utilisateur.js';
import fs from 'fs';
import path from 'path';

export const login = async (req, res) => {
    try {
        const result = await Utilisateur.login(req);
        if (result) {
            res.status(200).json({ success: true, ...result });
        } else {
            res.status(200).json({ success: false, message: "Identifiant ou mot de passe incorrect" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getUser = async (req, res) => {
    try {
        const user = await Utilisateur.getById(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updateUser = async (req, res) => {
    try {
        const currentData = await Utilisateur.getById(req.params.id);
        const newLogo = req.body.logo;

        // If a new logo is defined and different from the old one, delete the old file
        if (newLogo && currentData && currentData.logo && currentData.logo !== newLogo) {
            const oldPath = path.join('uploads', currentData.logo);
            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath, (err) => {
                    if (err) console.error("Erreur lors de la suppression de l'ancien logo:", err);
                });
            }
        }

        const result = await Utilisateur.update(req.params.id, req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const uploadLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        // Just return the filename, the frontend will update the user data with PUT /:id
        res.status(200).json({ filename: req.file.filename });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
