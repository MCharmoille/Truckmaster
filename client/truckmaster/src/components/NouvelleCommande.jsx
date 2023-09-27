import axios from 'axios';
import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ModalCustom from "./modals/CustomProduit";
import ModalBoissons from "./modals/Boissons";
import Confirm from "./modals/Confirm";
import moment from 'moment';

const Add = () => {
    const { commandeId } = useParams();
    const [commande, setCommande] = useState({
        libelle:"",
        date:moment(new Date()).format("YYYY-MM-DD"),
        time:"",
        paye:null
    });
    // TO DO : remplacer par une requête à l'API
    const produits_affiches = [
        {id : 1, display : true, onclick : () => modifierCommande(1, 1), nom : "Campagnard", prix : 10},
        {id : 2, display : true, onclick : () => modifierCommande(2, 1), nom : "Pouly", prix : 10},
        {id : 5, display : true, onclick : () => modifierCommande(5, 1), nom : "Classique", prix : 9},
        {id : 6, display : true, onclick : () => modifierCommande(6, 1), nom : "Lo'cale", prix : 11},
        {id : 7, display : true, onclick : () => modifierCommande(7, 1), nom : "Végé", prix : 9},
        {id : 8, display : true, onclick : () => modifierCommande(8, 1), nom : "Menu enfant", prix : 7},
        {id : 9, display : true, onclick : () => modifierCommande(9, 1), nom : "Spécial mois", prix : 11},
        {id : 99, display : true, onclick : () => modifierCommande(99, 1),  nom : "Autre", prix : 0},
        {id : 3, display : true, onclick : () => modifierCommande(3, 1), nom : "Frite", prix : 3},
        {id : 98, display : true, onclick : () => setModalBoissons(true),  nom : "Boisson", prix : 2},
        {id : 10, display : false, nom : "Coca", prix : 2},
        {id : 11, display : false, nom : "Orangina", prix : 2},
        {id : 12, display : false, nom : "Schweppes", prix : 2},
        {id : 13, display : false, nom : "Ice Tea", prix : 2},
        {id : 14, display : false, nom : "Caprisun", prix : 1},
        {id : 15, display : false, nom : "Bière", prix : 2},
        {id : 16, display : false, nom : "Bière locale", prix : 3.5}
    ];
    const [produitsCommandes, setProduitsCommandes] = useState([]);
    const [tempId, setTempId] = useState(0);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (commandeId) {
            axios.get(process.env.REACT_APP_API_URL+`commandes/id/${commandeId}`)
                .then((response) => {
                    setCommande(({
                        libelle: response.data.libelle,
                        date: moment(response.data.date_commande).format('YYYY-MM-DD'),
                        time: moment(response.data.date_commande).format('HH:mm'),
                        paye: response.data.moyen_paiement
                    }));
                    setProduitsCommandes(response.data.produits);
                    setTempId(response.data.produits.length);
                })
                .catch((error) => {
                    console.error("Erreur lors de la récupération de la commande existante :", error);
                });
        }
    }, [commandeId]);

    useEffect(() => {
        console.log("code au changement de date");
        // TO DO : aller chercher les stocks pour la date sélectionné
    }, [commande.date]);

    const validerCommande = async () => {
        const updatedCommande = {  libelle: document.querySelector('#input_libelle').value, 
                                   date_commande: `${document.querySelector('#input_date').value} ${document.querySelector('#input_time').value}:00`, 
                                   produits: produitsCommandes
                                };
        try {
            if (commandeId) await axios.post(process.env.REACT_APP_API_URL+"commandes/update/"+commandeId, updatedCommande);
            else await axios.post(process.env.REACT_APP_API_URL+"commandes", updatedCommande);
            navigate("/commandes");
        } catch (error) {
            console.error("Une erreur s'est produite lors de la requête POST :", error);
        }
    };

    const modifierCommande = (id, qte) => {
        var id_pc = -1;
        
        if(qte === -1){ // suppression d'un item, on cherche l'tempId de la cible
            id_pc = produitsCommandes.findIndex((p) => (p.tempId === id));
        }
        else { // ajout d'un item, on utilise l'id produit
            id_pc = produitsCommandes.findIndex((p) => (p.id_produit === id) && (!p.modifications || p.modifications.length === 0));
        }

        if (id_pc !== -1) { // item trouvé dans la liste
            const pc_clone = [...produitsCommandes];
            pc_clone[id_pc].qte += qte;
            if(pc_clone[id_pc].qte < 1) pc_clone.splice(id_pc, 1);
            setProduitsCommandes(pc_clone);
        } else { // nouvel item
            var produit = produits_affiches[produits_affiches.findIndex((p) => p.id === id)];
            setProduitsCommandes([...produitsCommandes, { id_produit: produit.id, nom: produit.nom, prix: produit.prix, qte: 1, tempId: tempId}]);
            setTempId(tempId + 1);
        }
    };

    useEffect(() => {
        var new_total = 0;
        
        for(var i in produitsCommandes){
            new_total += produitsCommandes[i].qte * produitsCommandes[i].prix;
        }
        setTotal(new_total);
    }, [produitsCommandes]);

    const [showModalCustom, setModalCustom] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const CloseModalCustom = (modifications) => {
        setModalCustom(false);
        
        const id_pc = produitsCommandes.findIndex((p) => p.tempId === selectedProduct.tempId);
        const pc_clone = [...produitsCommandes];
        pc_clone[id_pc].modifications = modifications;
        setProduitsCommandes(pc_clone);
    };

    const [showModalBoissons, setModalBoissons] = useState(false);

    const CloseModalBoisson = (id) => {
        setModalBoissons(false);
        modifierCommande(id, 1);
    };

    const [showConfirm, setshowConfirm] = useState(false);

    const supprimerCommande = async(confirm) => {
        setshowConfirm(false);
        if(confirm){
            await axios.delete(process.env.REACT_APP_API_URL+"commandes/supprimer/"+commandeId);
            navigate("/commandes");
        }
    }

    return (
        <div className='form'>
            {/* Partie gauche (liste des produits) */}
            <div className='zone_gauche'>
                {produits_affiches.filter((produit) => produit.display === true).map((produit, index) => (
                    <div className={`bt_produit ${produit.id === 3 || produit.id === 98 ? 'bt_large' : ''}`} 
                         onClick={produit.onclick}
                         key={index}> {produit.nom} </div>
                ))}
            </div>
            {/* Partie droite (récap + total) */}
            <div className='zone_droite'>
                <div className='recap'> 
                    <input type='text' id='input_libelle' placeholder='Nouvelle Commande' name='libelle' defaultValue={commande.libelle}/>
                    <div> 
                        <input id="input_date" type="date" value={commande.date} onChange={(e) => {setCommande((prevCommande) => ({ ...prevCommande, date: e.target.value }));}}/> 
                        <select id='input_time' name='time' value={commande.time} onChange={(e) => {setCommande((prevCommande) => ({ ...prevCommande, time: e.target.value }));}}>
                            <option> 18:00 </option><option> 18:15 </option><option> 18:30 </option><option> 18:45 </option>
                            <option> 19:00 </option><option> 19:15 </option><option> 19:30 </option><option> 19:45 </option>
                            <option> 20:00 </option><option> 20:15 </option><option> 20:30 </option><option> 20:45 </option>
                            <option> 21:00 </option><option> 21:15 </option><option> 21:30 </option><option> 21:45 </option>
                            <option> 22:00 </option><option> 22:15 </option><option> 22:30 </option><option> 22:45 </option>
                        </select>
                    </div>
                    <hr/>

                    <div className='contenu_commande'>
                    {produitsCommandes.map((produit, index) => (
                        <div key={index}> 
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}> 
                                <div> 
                                    <span className='enlever_article' onClick={() => modifierCommande(produit.tempId, -1)}> - </span> 
                                    <span onClick={() => {setSelectedProduct(produit); setModalCustom(true);}}>
                                        {produit.qte} x {produit.nom}
                                    </span>
                                </div> 
                                <div>{produit.prix} €</div>
                            </div>
                            {produit.modifications && produit.modifications.length > 0 ? (
                                produit.modifications.map((modif, m_index) => (
                                    <div className={`modification modificateur_${modif.modificateur}`} key={m_index}>
                                        {modif.modificateur === -1 ? "SANS " : modif.modificateur === 1 ? "SUPPLÉMENT " : ""}{modif.nom}
                                    </div>
                                ))
                            ) : null}
                        </div>
                    ))}
                        
                        
                    </div>
                </div>
                <div className='total'>{total} €</div>
                <div className='deja_paye'> { commande.paye !== null ? "Attention, cette commande à déjà été payée." :""} </div>
                {commandeId ? 
                    <div className='button-container'>
                        <div className='ajouter_small' onClick={validerCommande}> Modifier </div>
                        <div className='suppr_small' onClick={() => setshowConfirm(true)}> X </div>
                    </div>
                            : 
                    <div className='ajouter' onClick={validerCommande}> Ajouter </div>
                }
            </div>

            {showModalCustom && (
                <ModalCustom produit={selectedProduct} onClose={CloseModalCustom} />
            )}
            {showModalBoissons && (
                <ModalBoissons onClose={CloseModalBoisson} />
            )}
            {showConfirm && (
                <Confirm message="Voulez vous vraiment supprimer cette commande ?" onClose={supprimerCommande} />
            )}
        </div>
    )
}

export default Add