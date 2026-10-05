import axios from 'axios';
import Achat from '../models/Achat.js';
import { db, query } from '../lib/db.js';
import { customConsoleLog } from '../lib/logger.js';
import { getUserId } from '../middleware/auth.js';
import { addMonths, nextMonthlyOccurrence, parseDateTime, toFrenchDate, toSqlDateTime } from '../lib/date.js';

export const AI_MONTHLY_LIMIT = 50;

export function quotaDecision(user, now = new Date()) {
    const stored = parseDateTime(user?.ai_next_reset);
    const due = !stored || stored <= now;
    const count = due ? 0 : Number(user.ai_usage_monthly) || 0;

    let nextReset = stored;
    if (due) {
        nextReset = stored ? nextMonthlyOccurrence(stored, now) : addMonths(now, 1);
    }

    return {
        blocked: count >= AI_MONTHLY_LIMIT,
        count,
        due,
        nextReset,
    };
}

export const scanReceipt = async (req, res) => {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    try {
        if (!req.file) {
            customConsoleLog(`[IA Scan] Erreur : Aucune image reçue.`);
            return res.status(400).json({ message: "Aucune image reçue par le serveur." });
        }

        if (!GEMINI_API_KEY) {
            customConsoleLog(`[IA Scan] GEMINI_API_KEY absente.`);
            return res.status(503).json({ message: "Service IA indisponible." });
        }

        const id_utilisateur = getUserId(req);
        customConsoleLog(`[IA Scan] Début de l'analyse pour l'utilisateur ${id_utilisateur}`);

        const userResults = await query(
            db,
            'SELECT ai_usage_monthly, ai_next_reset FROM utilisateurs WHERE id = ?',
            [id_utilisateur]
        );

        const decision = quotaDecision(userResults[0]);
        if (decision.blocked) {
            customConsoleLog(`[IA Scan] Quota atteint pour l'utilisateur ${id_utilisateur}`);
            return res.status(403).json({
                message: `Quota IA atteint (50/50). Prochain renouvellement le ${toFrenchDate(decision.nextReset)}.`,
            });
        }

        customConsoleLog(`[IA Scan] Récupération du contexte des produits...`);
        const existingNames = await Achat.getUniqueNames(id_utilisateur);
        const namesContext = existingNames.length > 0
            ? `Voici une liste de nos articles existants pour t'aider à corriger les noms abrégés : ${existingNames.join(', ')}.`
            : "";

        const imageBase64 = req.file.buffer.toString('base64');
        const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

        const prompt = `
            Tu es un assistant comptable pour un Food Truck nommé Truckmaster. 
            Analyse cette photo de ticket de caisse et extrait tous les articles achetés.
            Pour chaque article, retourne un objet JSON avec :
            - "nom": le nom de l'article (sois précis, corrige les abréviations si possible). ${namesContext}
            - "quantite": la quantité (nombre).
            - "prix": le prix TOTAL pour cet article (nombre).

            Si l'image n'est pas un ticket de caisse, est illisible ou ne contient aucun article d'achat, retourne UNIQUEMENT un tableau vide : [].
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

        const jsonMatch = resultText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            resultText = jsonMatch[0];
        }

        let extractedItems = [];
        try {
            extractedItems = JSON.parse(resultText);
            if (!Array.isArray(extractedItems)) extractedItems = [];
        } catch (e) {
            customConsoleLog(`[IA Scan] Erreur parsing JSON : ${e.message}`);
            extractedItems = [];
        }

        if (extractedItems.length === 0) {
            customConsoleLog(`[IA Scan] Aucun article trouvé ou image invalide.`);
            return res.status(200).json([]);
        }

        customConsoleLog(`[IA Scan] Incrémentation du quota...`);
        await query(
            db,
            'UPDATE utilisateurs SET ai_usage_monthly = ?, ai_next_reset = ? WHERE id = ?',
            [decision.count + 1, toSqlDateTime(decision.nextReset), id_utilisateur]
        );

        customConsoleLog(`[IA Scan] Scan IA terminé avec succès pour user ${id_utilisateur} : ${extractedItems.length} articles trouvés`);

        res.status(200).json(extractedItems);
    } catch (error) {
        if (error.code === 'ER_BAD_FIELD_ERROR') {
            customConsoleLog("[IA Scan] Colonne ai_next_reset absente sur utilisateurs.");
            return res.status(500).json({ message: "Le compteur de scans n'est pas à jour. Prévenez l'administrateur." });
        }

        const errorDetail = error.response?.data || error.message;
        const googleMessage = error.response?.data?.error?.message;
        customConsoleLog(`[IA Scan] Erreur CRITIQUE : ${JSON.stringify(errorDetail, null, 2)}`);

        if (error.response?.status === 429) {
            return res.status(429).json({
                message: "Limite quota dépassée. Réessayez dans une minute.",
            });
        }

        res.status(500).json({
            message: googleMessage ? "Erreur lors de l'analyse du ticket par l'IA" : "Erreur lors de l'analyse du ticket par l'IA",
        });
    }
};
