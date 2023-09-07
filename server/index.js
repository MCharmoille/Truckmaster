import express from "express"
import mysql from "mysql2"
import cors from "cors"

import produitsRoutes from './routes/produits.js';
import commandesRoutes from './routes/commandes.js';

const app = express()

app.use(express.json())
app.use(cors())

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

db.connect((err) => {
    if (err) {
      console.error('Erreur de connexion à la base de données :', err);
      return;
    }
  
    console.log('Connexion à la base de données MySQL établie !');
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

app.listen(8800, () =>{
    console.log("Le serveur Truckmaster est correctement démarré.")
})