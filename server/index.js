import './lib/systemCa.js'
import express from "express"
import dotenv from "dotenv"
dotenv.config()

import cors from "cors"
import https from 'https'
import fs from 'fs'

import { customConsoleLog } from './lib/logger.js'
import { getJwtSecret } from './lib/config.js'
import { requireAuth } from './middleware/auth.js'

import produitsRoutes from './routes/produits.js'
import commandesRoutes from './routes/commandes.js'
import datesRoutes from './routes/dates.js'
import utilisateursRoutes from './routes/utilisateurs.js'
import tranchesRoutes from './routes/tranches.js'
import ingredientsRoutes from './routes/ingredients.js'
import achatsRoutes from './routes/achats.js'
import devisRoutes from './routes/devis.js'

getJwtSecret()

const app = express()

if (process.env.NODE_ENV === 'dev') {
    app.use(cors())
} else {
    const corsOptions = {
        origin: ['http://truckmaster.ovh', 'http://www.truckmaster.ovh', 'https://truckmaster.ovh', 'https://www.truckmaster.ovh'],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    }
    app.use(cors(corsOptions))
}

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads')
}
app.use(express.json())
app.use('/uploads', express.static('uploads'))

if (process.env.NODE_ENV === 'dev') {
    app.listen(8800, () => {
        customConsoleLog("Le serveur Truckmaster est correctement démarré en local.")
    })
} else {
    const credentials = {
        key: fs.readFileSync('/etc/letsencrypt/live/truckmaster.ovh/privkey.pem', 'utf8'),
        cert: fs.readFileSync('/etc/letsencrypt/live/truckmaster.ovh/fullchain.pem', 'utf8'),
    }

    const httpsServer = https.createServer(credentials, app)

    httpsServer.listen(8800, () => {
        customConsoleLog("Le serveur HTTPS Truckmaster est correctement démarré en production.")
    })
}

app.use('/utilisateurs', utilisateursRoutes)
app.use('/produits', requireAuth, produitsRoutes)
app.use('/commandes', requireAuth, commandesRoutes)
app.use('/dates', requireAuth, datesRoutes)
app.use('/tranches', requireAuth, tranchesRoutes)
app.use('/ingredients', requireAuth, ingredientsRoutes)
app.use('/achats', requireAuth, achatsRoutes)
app.use('/devis', requireAuth, devisRoutes)
