import axios from 'axios';
import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

const Add = () => {
    const [commande, setCommande] = useState({
        libelle:"Nouvelle commande",
        time:"18:00",
        produits:[]
    })

    // TO DO : remplacer par une requête à l'API
    const produits_affiches = [
        {id : 1, nom : "Campagnard", prix : 10},
        {id : 2, nom : "Pouly", prix : 10},
        {id : 5, nom : "Classique", prix : 10},
        {id : 6, nom : "Lo'cale", prix : 11},
        {id : 7, nom : "Végé", prix : 10},
        {id : 8, nom : "Menu enfant", prix : 7},
        {id : 9, nom : "Spécial mois", prix : 11},
        {id : 10, nom : "Autre", prix : 0},
        {id : 3, nom : "Frite", prix : 3},
        {id : 12, nom : "Boisson", prix : 2}
    ];

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
            const updatedCommande = { ...commande, date_commande: dateCreation, produits: produits_commandes};

            try {
              await axios.post("http://37.187.55.12:8800/commandes", updatedCommande);
              navigate("/commandes");
            } catch (error) {
              console.error("Une erreur s'est produite lors de la requête POST :", error);
            }
        }catch(err){
            console.log(err)
        }
    };


    const [produits_commandes, setProduitsCommandes] = useState([]);
    const [total, setTotal] = useState(0);

    const modifier_commande = (id, qte) => {
        const id_pc = produits_commandes.findIndex((p) => p.id === id);

        if (id_pc !== -1) {
            const pc_clone = [...produits_commandes];
            pc_clone[id_pc].qte += qte;
            if(pc_clone[id_pc].qte < 1) pc_clone.splice(id_pc, 1);
            setProduitsCommandes(pc_clone);
        } else {
            var produit = produits_affiches[produits_affiches.findIndex((p) => p.id === id)];
            setProduitsCommandes([...produits_commandes, { id: produit.id, nom: produit.nom, prix: produit.prix, qte: 1 }]);
        }
    };

    useEffect(() => {
        var new_total = 0;
        console.log(produits_commandes);
        for(var i in produits_commandes){
            new_total += produits_commandes[i].qte * produits_commandes[i].prix;
        }
        setTotal(new_total);
    }, [produits_commandes]);

    return (
        <div className='form'>
            {/* Partie gauche (liste des produits) */}
            <div className='zone_gauche'>
                {produits_affiches.map((produit, index) => (
                    <div className={`bt_produit ${produit.id === 3 || produit.id === 12 ? 'bt_large' : ''}`} 
                         onClick={() => modifier_commande(produit.id, 1)}> {produit.nom} </div>
                ))}
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
                                <div> 
                                    <span className='enlever_article' onClick={() => modifier_commande(produit.id, -1)}> - </span> 
                                    {produit.qte} x {produit.nom}
                                </div> 
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