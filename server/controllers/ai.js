import axios from 'axios';
import Achat from '../models/Achat.js';
import { db, customConsoleLog } from '../index.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

export const scanReceipt = async (req, res) => {
    try {
        if (!req.file) {
            customConsoleLog(`[IA Scan] Erreur : Aucune image reçue.`);
            return res.status(400).json({ message: "Aucune image reçue par le serveur." });
        }

        // 0. Vérifier le quota
        const id_utilisateur = 1;
        customConsoleLog(`[IA Scan] Début de l'analyse pour l'utilisateur ${id_utilisateur}`);

        const userResults = await new Promise((resolve, reject) => {
            db.query('SELECT ai_usage_monthly FROM utilisateurs WHERE id = ?', [id_utilisateur], (err, rows) => {
                if (err) {
                    customConsoleLog(`[IA Scan] Erreur quota DB: ${err.message}`);
                    return reject(err);
                }
                resolve(rows);
            });
        });

        const user = userResults[0];
        if (user && user.ai_usage_monthly >= 50) {
            customConsoleLog(`[IA Scan] Quota atteint pour l'utilisateur ${id_utilisateur}`);
            return res.status(403).json({ message: "Quota IA mensuel atteint (50/50). Revenez le mois prochain !" });
        }

        // 1. Récupérer les noms existants pour aider l'IA
        customConsoleLog(`[IA Scan] Récupération du contexte des produits...`);
        const existingNames = await Achat.getUniqueNames();
        const namesContext = existingNames.length > 0
            ? `Voici une liste de nos articles existants pour t'aider à corriger les noms abrégés : ${existingNames.join(', ')}.`
            : "";

        // 2. Préparer l'image pour Gemini (base64)
        const imageBase64 = req.file.buffer.toString('base64');

        // 3. Appeler Gemini
        const prompt = `
            Tu es un assistant comptable pour un Food Truck nommé Truckmaster. 
            Analyse cette photo de ticket de caisse et extrait tous les articles achetés.
            Pour chaque article, retourne un objet JSON avec :
            - "nom": le nom de l'article (sois précis, corrige les abréviations si possible). ${namesContext}
            - "quantite": la quantité (nombre).
            - "prix": le prix TOTAL pour cet article (nombre).

            Retourne UNIQUEMENT une liste JSON compacte. 
            Exemple de format attendu : [{"nom": "Pain Burger", "quantite": 10, "prix": 15.50}, ...]
        `;

        customConsoleLog(`[IA Scan] Envoi de l'image à Gemini...`);
        const response = await axios.post(GEMINI_URL, {
            contents: [{
                parts: [
                    { text: prompt },
                    {
                        inline_data: {
                            mime_type: req.file.mimetype,
                            data: imageBase64
                        }
                    }
                ]
            }]
        });

        customConsoleLog(`[IA Scan] Réponse reçue de Gemini, parsing...`);
        let resultText = response.data.candidates[0].content.parts[0].text;

        // Nettoyage au cas où l'IA inclut des blocs de code markdown ```json ... ```
        const jsonMatch = resultText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            resultText = jsonMatch[0];
        }

        const extractedItems = JSON.parse(resultText);

        // 4. Incrémenter le quota
        customConsoleLog(`[IA Scan] Incrémentation du quota...`);
        await new Promise((resolve, reject) => {
            db.query('UPDATE utilisateurs SET ai_usage_monthly = ai_usage_monthly + 1 WHERE id = ?', [id_utilisateur], (err) => {
                if (err) {
                    customConsoleLog(`[IA Scan] Erreur incrément quota DB: ${err.message}`);
                    return reject(err);
                }
                resolve();
            });
        });

        customConsoleLog(`[IA Scan] Scan IA terminé avec succès pour user ${id_utilisateur} : ${extractedItems.length} articles trouvés`);

        res.status(200).json(extractedItems);
    } catch (error) {
        const errorDetail = error.response?.data || error.message;
        customConsoleLog(`[IA Scan] Erreur CRITIQUE : ${JSON.stringify(errorDetail, null, 2)}`);

        if (error.response?.status === 429) {
            return res.status(429).json({
                message: "Limite d'utilisation de l'IA atteinte (Google). Réessayez dans une minute.",
                details: errorDetail
            });
        }

        res.status(500).json({
            message: "Erreur lors de l'analyse du ticket par l'IA",
            details: errorDetail
        });
    }
};
