import { db, customConsoleLog } from '../index.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class Utilisateur {
  static async login(req, res) {
    return new Promise((resolve, reject) => {
        var query = "SELECT * FROM utilisateurs WHERE identifiant = '"+req.body.identifiant+"'";
      
        db.query(query, async (err, user) =>{
            if(err) reject(err)

            if (user.length !== 1 || !(await bcrypt.compare(req.body.password, user[0].motdepasse))) {
                console.log("Nom d'utilisateur ou mot de passe incorrect.");
                resolve(false);
            } else {
                var username = user[0].nom;
                const token = jwt.sign({ username }, 'tempsecretkey');
                res.json({ token, username });
            }
        });
    });
  }
}

export default Utilisateur;