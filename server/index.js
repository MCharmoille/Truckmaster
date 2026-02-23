import express from "express"
import dotenv from "dotenv"
dotenv.config()
import mysql from "mysql2"
import cors from "cors"
import moment from "moment"

import produitsRoutes from './routes/produits.js';
import commandesRoutes from './routes/commandes.js';
import datesRoutes from './routes/dates.js';
import utilisateursRoutes from './routes/utilisateurs.js';
import tranchesRoutes from './routes/tranches.js';
import ingredientsRoutes from './routes/ingredients.js';
import achatsRoutes from './routes/achats.js';

import https from 'https';
import fs from 'fs';

const app = express();
var db = {};

app.use(express.json());

if (process.env.NODE_ENV === 'dev') {
    app.use(cors());

    app.listen(8800, () => {
        customConsoleLog("Le serveur Truckmaster est correctement démarré en local.");
    })

    db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'ohtruckdesesse'
    });
} else {
    const credentials = {
        key: fs.readFileSync('/etc/letsencrypt/live/truckmaster.ovh/privkey.pem', 'utf8'),
        cert: fs.readFileSync('/etc/letsencrypt/live/truckmaster.ovh/fullchain.pem', 'utf8'),
    };

    const corsOptions = {
        origin: ['http://truckmaster.ovh', 'http://www.truckmaster.ovh', 'https://truckmaster.ovh', 'https://www.truckmaster.ovh'],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    };

    app.use(cors(corsOptions));

    const httpsServer = https.createServer(credentials, app);

    httpsServer.listen(8800, () => {
        customConsoleLog("Le serveur HTTPS Truckmaster est correctement démarré en production.")
    });

    db = mysql.createConnection({
        host: '37.187.55.12',
        user: 'maxime',
        password: 'MotdS!',
        database: 'ohtruckdesesse'
    });
}

export { db, moment }; // pour utiliser la connexion dans toute l'app

app.use('/produits', produitsRoutes);
app.use('/commandes', commandesRoutes);
app.use('/dates', datesRoutes);
app.use('/utilisateurs', utilisateursRoutes);
app.use('/tranches', tranchesRoutes);
app.use('/ingredients', ingredientsRoutes);
app.use('/achats', achatsRoutes);

// fonction utilitaire, si il y en a plusieurs, créer un fichier util.js
function customConsoleLog(message) {
    const formattedDate = new Date().toLocaleString('fr-FR');

    console.log(`[${formattedDate}] ${message}`);
}
export { customConsoleLog };

// devis
app.get("/devis", (req, res) => {
    const q = "SELECT * FROM devis WHERE id_utilisateur = 1 ORDER BY id DESC"
    db.query(q, (err, devis) => {
        if (err) return res.json(err)

        const devisIds = devis.map((devis) => devis.id);
        const q2 = "SELECT * FROM devis_produits dp JOIN produits p ON dp.id_produit=p.id_produit WHERE id_devis IN (?)";
        db.query(q2, [devisIds], (err, devisProduits) => {
            if (err) return res.json(err);

            const devisMap = new Map();

            devis.forEach((devis) => {
                devisMap.set(devis.id, {
                    ...devis,
                    devis_produits: [],
                });
            });

            devisProduits.forEach((devisProduit) => {
                const devisId = devisProduit.id_devis;
                if (devisMap.has(devisId)) {
                    devisMap.get(devisId).devis_produits.push(devisProduit);
                }
            });

            const result = Array.from(devisMap.values());

            return res.json(result);
        });
    })
})



