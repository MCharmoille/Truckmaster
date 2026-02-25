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
import devisRoutes from './routes/devis.js';

import https from 'https';
import fs from 'fs';

const app = express();
var db = {};

// 1. Handle CORS early (especially before static files to allow PDF renderer to fetch images)
if (process.env.NODE_ENV === 'dev') {
    app.use(cors());
} else {
    const corsOptions = {
        origin: ['http://truckmaster.ovh', 'http://www.truckmaster.ovh', 'https://truckmaster.ovh', 'https://www.truckmaster.ovh'],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    };
    app.use(cors(corsOptions));
}

// 2. Body parsing and static files
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// 3. Server listen and DB connection
if (process.env.NODE_ENV === 'dev') {
    app.listen(8800, () => {
        customConsoleLog("Le serveur Truckmaster est correctement démarré en local.");
    });

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
app.use('/devis', devisRoutes);

// fonction utilitaire
function customConsoleLog(message) {
    const formattedDate = new Date().toLocaleString('fr-FR');
    console.log(`[${formattedDate}] ${message}`);
}
export { customConsoleLog };
