import axios from 'axios';
import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from "./modals/CustomProduit";
import ModalBoissons from "./modals/Boissons";
import moment from 'moment';

const Add = () => {
    const { commandeId } = useParams();
    const [commande, set_commande] = useState({
        libelle:"",
        date:moment(new Date()).format("YYYY-MM-DD"),
        time:"",
        paye:null
    });
    // TO DO : remplacer par une requête à l'API
    const produits_affiches = [
        {id : 1, display : true, onclick : () => modifier_commande(1, 1), nom : "Campagnard", prix : 10},
        {id : 2, display : true, onclick : () => modifier_commande(2, 1), nom : "Pouly", prix : 10},
        {id : 5, display : true, onclick : () => modifier_commande(5, 1), nom : "Classique", prix : 9},
        {id : 6, display : true, onclick : () => modifier_commande(6, 1), nom : "Lo'cale", prix : 11},
        {id : 7, display : true, onclick : () => modifier_commande(7, 1), nom : "Végé", prix : 9},
        {id : 8, display : true, onclick : () => modifier_commande(8, 1), nom : "Menu enfant", prix : 7},
        {id : 9, display : true, onclick : () => modifier_commande(9, 1), nom : "Spécial mois", prix : 11},
        {id : 99, display : true, onclick : () => modifier_commande(99, 1),  nom : "Autre", prix : 0},
        {id : 3, display : true, onclick : () => modifier_commande(3, 1), nom : "Frite", prix : 3},
        {id : 98, display : true, onclick : () => handleClickBoissons(),  nom : "Boisson", prix : 2},
        {id : 10, display : false, nom : "Coca", prix : 2},
        {id : 11, display : false, nom : "Orangina", prix : 2},
        {id : 12, display : false, nom : "Schweppes", prix : 2},
        {id : 13, display : false, nom : "Ice Tea", prix : 2},
        {id : 14, display : false, nom : "Caprisun", prix : 1},
        {id : 15, display : false, nom : "Bière", prix : 2},
        {id : 16, display : false, nom : "Bière locale", prix : 3.5}
    ];
    const [produits_commandes, set_produits_commandes] = useState([]);
    const [temp_id, set_temp_id] = useState(0);
    const [total, set_total] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (commandeId) {
            axios.get(process.env.REACT_APP_API_URL+`commandes/id/${commandeId}`)
                .then((response) => {
                    set_commande(({
                        libelle: response.data.libelle,
                        date: moment(response.data.date_commande).format('YYYY-MM-DD'),
                        time: moment(response.data.date_commande).format('HH:mm'),
                        paye: response.data.moyen_paiement
                    }));
                    set_produits_commandes(response.data.produits);
                    set_temp_id(response.data.produits.length);
                })
                .catch((error) => {
                    console.error("Erreur lors de la récupération de la commande existante :", error);
                });
        }
    }, [commandeId]);

    const handleClick = async () => {
        const today = new Date();
        const updatedCommande = {  libelle: document.querySelector('#input_libelle').value, 
                                   date_commande: `${document.querySelector('#input_date').value} ${document.querySelector('#input_time').value}:00`, 
                                   produits: produits_commandes
                                };
        try {
            if (commandeId) await axios.post(process.env.REACT_APP_API_URL+"commandes/update/"+commandeId, updatedCommande);
            else await axios.post(process.env.REACT_APP_API_URL+"commandes", updatedCommande);
            navigate("/commandes");
        } catch (error) {
            console.error("Une erreur s'est produite lors de la requête POST :", error);
        }
    };

    const modifier_commande = (id, qte) => {
        var id_pc = -1;
        
        if(qte === -1){ // suppression d'un item, on cherche l'temp_id de la cible
            id_pc = produits_commandes.findIndex((p) => (p.temp_id === id));
        }
        else { // ajout d'un item, on utilise l'id produit
            id_pc = produits_commandes.findIndex((p) => (p.id_produit === id) && (!p.modifications || p.modifications.length === 0));
        }

        if (id_pc !== -1) { // item trouvé dans la liste
            const pc_clone = [...produits_commandes];
            pc_clone[id_pc].qte += qte;
            if(pc_clone[id_pc].qte < 1) pc_clone.splice(id_pc, 1);
            set_produits_commandes(pc_clone);
        } else { // nouvel item
            var produit = produits_affiches[produits_affiches.findIndex((p) => p.id === id)];
            set_produits_commandes([...produits_commandes, { id_produit: produit.id, nom: produit.nom, prix: produit.prix, qte: 1, temp_id: temp_id}]);
            set_temp_id(temp_id + 1);
        }
    };

    useEffect(() => {
        var new_total = 0;
        
        for(var i in produits_commandes){
            new_total += produits_commandes[i].qte * produits_commandes[i].prix;
        }
        set_total(new_total);
    }, [produits_commandes]);

    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleClickProduit = (produit) => {
        setSelectedProduct(produit);
        setShowModal(true);
    };

    const handleCloseModal = (modifications) => {
        setShowModal(false);
        
        const id_pc = produits_commandes.findIndex((p) => p.temp_id === selectedProduct.temp_id);
        const pc_clone = [...produits_commandes];
        pc_clone[id_pc].modifications = modifications;
        set_produits_commandes(pc_clone);
    };

    const [showModalBoissons, setShowModalBoissons] = useState(false);

    const handleClickBoissons = () => {
        setShowModalBoissons(true);
    };

    const handleCloseModalBoissons = (id) => {
        setShowModalBoissons(false);
        modifier_commande(id, 1)
    };

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
                        <input id="input_date" type="date" value={commande.date} onChange={(e) => {set_commande((prevCommande) => ({ ...prevCommande, date: e.target.value }));}}/> 
                        <select id='input_time' name='time' value={commande.time} onChange={(e) => {set_commande((prevCommande) => ({ ...prevCommande, time: e.target.value }));}}>
                            <option> 18:00 </option><option> 18:15 </option><option> 18:30 </option><option> 18:45 </option>
                            <option> 19:00 </option><option> 19:15 </option><option> 19:30 </option><option> 19:45 </option>
                            <option> 20:00 </option><option> 20:15 </option><option> 20:30 </option><option> 20:45 </option>
                            <option> 21:00 </option><option> 21:15 </option><option> 21:30 </option><option> 21:45 </option>
                            <option> 22:00 </option><option> 22:15 </option><option> 22:30 </option><option> 22:45 </option>
                        </select>
                    </div>
                    <hr/>

                    <div className='contenu_commande'>
                    {produits_commandes.map((produit, index) => (
                        <div key={index}> 
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}> 
                                <div> 
                                    <span className='enlever_article' onClick={() => modifier_commande(produit.temp_id, -1)}> - </span> 
                                    <span onClick={() => handleClickProduit(produit)}>
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
                <div className='ajouter' onClick={handleClick}>{commandeId ? "Modifier" : "Ajouter"}</div>
            </div>

            {/* Afficher la fenêtre modale si showModal est true */}
            {showModal && (
                <Modal produit={selectedProduct} onClose={handleCloseModal} />
            )}
            {showModalBoissons && (
                <ModalBoissons onClose={handleCloseModalBoissons} />
            )}
        </div>
    )
}

export default Add