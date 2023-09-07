import axios from 'axios';
import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Add = () => {
    const [commande, setCommande] = useState({
        libelle:"Nouvelle commande",
        time:"18:00",
        produits:[]
    })

    const navigate = useNavigate()

    const handleChange = (e) => {
        setCommande((prev) => ({...prev, [e.target.name]: e.target.value }));
    };

    const handleClick = async e => {
        e.preventDefault()
        try{
            const today = new Date();
            const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            const dateCreation = `${formattedDate} ${commande.time}:00`;
            const updatedCommande = { ...commande, date_creation: dateCreation, produits: produits_commandes};

            await axios.post("http://37.187.55.12:8800/commandes", updatedCommande);
            navigate("/commandes");
        }catch(err){
            console.log(err)
        }
    };


    const [produits_commandes, setProduitsCommandes] = useState([]);
    const [total, setTotal] = useState(0);

    const handleProductClick = (nomProduit, prix) => {
        const existingProductIndex = produits_commandes.findIndex((produit) => produit.nom === nomProduit);
    
        if (existingProductIndex !== -1) {
            const updatedProduits = [...produits_commandes];
            updatedProduits[existingProductIndex].qte += 1;
            setProduitsCommandes(updatedProduits);
        } else {
            setProduitsCommandes([...produits_commandes, { nom: nomProduit, qte: 1, prix: prix }]);
        }
    
        Recalcul_total();
    };

    const Recalcul_total = () => {
        var new_total = 0;
        console.log(produits_commandes);
        for(var i in produits_commandes){
            new_total += produits_commandes[i].qte * produits_commandes[i].prix;
        }

        console.log(new_total);
        setTotal(new_total);
    }

    return (
        <div className='form'>
            {/* Partie gauche (liste des produits) */}
            <div className='zone_gauche'>
                <div className='bt_produit' onClick={() => handleProductClick("Campagnard", 10)}> Campagnard </div> 
                <div className='bt_produit' onClick={() => handleProductClick("Pouly", 10)}> Pouly </div>
                <div className='bt_produit' onClick={() => handleProductClick("Classique", 10)}> Classique </div> 
                <div className='bt_produit' onClick={() => handleProductClick("Lo'cale", 11)}> Lo'cale </div>
                <div className='bt_produit' onClick={() => handleProductClick("Végé", 10)}> Végé </div> 
                <div className='bt_produit' onClick={() => handleProductClick("Menu enfant", 7)}> Menu enfant </div>
                <div className='bt_produit' onClick={() => handleProductClick("Burger du mois", 11)}> Burger du mois </div> 
                <div className='bt_produit'>  </div>
                <div className='bt_produit bt_frite' onClick={() => handleProductClick("Frite", 3)}> Frite </div> 
                <div className='bt_produit bt_boisson' onClick={() => handleProductClick("Boisson", 2)}> Boisson </div>
            </div>
            {/* Partie droite (récap + total) */}
            <div className='zone_droite'>
                <div className='recap'> 
                    <input type='text' id='input_libelle' placeholder='Nouvelle Commande' name='libelle' onChange={handleChange}/>
                    <select id='input_time' name='time' onChange={handleChange}>
                        <option> 18:00 </option><option> 18:15 </option><option> 18:30 </option><option> 18:45 </option>
                        <option> 19:00 </option><option> 19:15 </option><option> 19:30 </option><option> 19:45 </option>
                        <option> 20:00 </option><option> 20:15 </option><option> 20:30 </option><option> 20:45 </option>
                        <option> 21:00 </option><option> 21:15 </option><option> 21:30 </option><option> 21:45 </option>
                        <option> 22:00 </option><option> 22:15 </option><option> 22:30 </option><option> 22:45 </option>
                    </select>
                    <hr/>

                    <div className='contenu_commande'>
                        {produits_commandes.map((produit, index) => (
                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}> 
                                <div>{produit.qte} x {produit.nom}</div> 
                                <div>{produit.prix} €</div> 
                            </div>
                        ))}
                    </div>
                </div>
                <div className='total'>{total} €</div>
                <div className='ajouter' onClick={handleClick}>Ajouter</div>
            </div>

        </div>
    )
}

export default Add