import express from "express"
import mysql from "mysql2"
import cors from "cors"

import produitsRoutes from './routes/produits.js';
import commandesRoutes from './routes/commandes.js';

const https = require('https');
const fs = require('fs');
const app = express();

// Chemin vers les fichiers de certificat SSL
const privateKey = fs.readFileSync('/etc/letsencrypt/live/truckmaster.ovh/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/truckmaster.ovh/fullchain.pem', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
};



app.use(express.json())
// app.use(cors());
const corsOptions = {
  origin: ['http://truckmaster.ovh', 'http://www.truckmaster.ovh', 'https://truckmaster.ovh', 'https://www.truckmaster.ovh'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));

// Utilisez les certificats SSL pour créer un serveur HTTPS
const httpsServer = https.createServer(credentials, app);


const db = mysql.createConnection({
  host: '37.187.55.12',
  user: 'maxime',
  password: 'MotdS!',
  database: 'ohtruckdesesse'
}); 

export { db }; // pour utiliser la connexion dans toute l'app

app.use('/produits', produitsRoutes);
app.use('/commandes', commandesRoutes);

app.get("/", (req, res) => {
    res.json("Index Truckmaster")
})

httpsServer.listen(8800, () => {
    console.log("Le serveur HTTPS est correctement démarré sur le port 8800.");
  });

// devis
app.get("/devis", (req, res) => {
    const q = "SELECT * FROM devis WHERE id_utilisateur = 1 ORDER BY id DESC"
    db.query(q,(err, devis) =>{
        if(err) return res.json(err)
        
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



