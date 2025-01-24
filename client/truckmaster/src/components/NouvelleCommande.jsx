import axios from 'axios';
import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ModalCustom from "./modals/CustomProduit";
import ModalBoissons from "./modals/Boissons";
import Confirm from "./modals/Confirm";
import moment from 'moment';
import 'moment/locale/fr';


const Add = () => {
    const { commandeId } = useParams();
    const [commande, setCommande] = useState({
        libelle:"",
        date:"",
        time:"",
        paye:null
    });
    const [dates, setDates] = useState([]);
    const [tranches, setTranches] = useState([]);
    const [isMidiSoir, setIsMidiSoir] = useState({"midi" : 1, "soir" : 1})
    const [produitsAffiches, setproduitsAffiches] = useState([]);
    const [produitsCommandes, setProduitsCommandes] = useState([]);
    const [tempId, setTempId] = useState(0);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();

    useEffect(() => { // recupere les dates et tranches
        try {
            axios.get(`${process.env.REACT_APP_API_URL}dates`)
            .then((res) => {
                setDates(res.data.reverse());
                setIsMidiSoir({"midi" : res.data[0].cb_midi, "soir" : res.data[0].cb_soir});
            })
            .catch((error) => {
                console.error("Erreur lors de la récupération de la commande existante :", error);
            });
            
            axios.get(`${process.env.REACT_APP_API_URL}tranches`)
            .then((res) => {
                setTranches(res.data);
            })
            .catch((error) => {
                console.error("Erreur lors de la récupération de la commande existante :", error);
            });

        } catch (err) {
          console.log(err);
        }
        
    }, []);

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
        if(commande.date === "") return;
        axios.get(`${process.env.REACT_APP_API_URL}dates/id/${commande.date}`)
            .then((res) => {
                setIsMidiSoir({"midi" : res.data.cb_midi, "soir" : res.data.cb_soir});
            })
            .catch((error) => {
                console.error("Erreur lors de la récupération de la date", error);
            });
    }, [commande.date]);

    useEffect(() => {
        axios.get(process.env.REACT_APP_API_URL + `produits/produitsAffiches`)
            .then((response) => {
                setproduitsAffiches(response.data);
            })
            .catch((error) => {
                console.error("Erreur lors de la récupération des produits à afficher :", error);
            });
    }, []);

    const formatDate = (date) => {
        return moment(date).format('dddd D MMMM');
    };
    
    const handleClick = (id) => {
        var produit = produitsAffiches[produitsAffiches.findIndex((p) => p.id_produit === id)];

        switch(produit.action){
            case "modifier" :
                modifierCommande(produit.id_produit, 1);
                break;
            case "setModalBoissons":
                setModalBoissons(true);
                break;
            default : 
                break;
        }
    };

    const validerCommande = async () => {
        if(produitsCommandes.length === 0){ alert("Attention, la commande est vide !"); return false;}

        commande.date = commande.date || dates[0].jour;
        commande.time = commande.time || tranches[0].tranche;
        const updatedCommande = {  libelle: document.querySelector('.com_libelle').value, 
                                   date_commande: `${commande.date} ${commande.time}:00`, 
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

        if(qte === -1){ // suppression d'un item, on cherche le tempId de la cible
            id_pc = produitsCommandes.findIndex((p) => (p.tempId === id));
        }
        else { // ajout d'un item, on cherche si il y en a déjà dans la commande (non modifié)
            id_pc = produitsCommandes.findIndex((p) => (p.id_produit === id) && (!p.modifications || p.modifications.length === 0) && (p.custom === 0));
        }

        if (id_pc !== -1) { // item trouvé dans la liste, on ajoute ou diminue la quantité
            const pc_clone = [...produitsCommandes];
            pc_clone[id_pc].qte += qte;
            if(pc_clone[id_pc].qte < 1) pc_clone.splice(id_pc, 1);
            setProduitsCommandes(pc_clone);
        } else { // nouvel item
            var produit = produitsAffiches[produitsAffiches.findIndex((p) => p.id_produit === id)];
            setProduitsCommandes([...produitsCommandes, { id_produit: produit.id_produit, nom: produit.nom, prix: produit.prix_produit, qte: 1, tempId: tempId, custom: 0}]);
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

    const CloseModalCustom = (modifications, nouveauPrix) => {
        setModalCustom(false);
        
        const id_pc = produitsCommandes.findIndex((p) => p.tempId === selectedProduct.tempId);
        const pc_clone = [...produitsCommandes];
        pc_clone[id_pc].modifications = modifications;
        if(pc_clone[id_pc].prix !== parseFloat(nouveauPrix)){ 
            pc_clone[id_pc].prix = parseFloat(nouveauPrix);
            pc_clone[id_pc].custom = 1;
        }

        setProduitsCommandes(pc_clone);
    };

    const [showModalBoissons, setModalBoissons] = useState(false);

    const CloseModalBoisson = (id) => {
        setModalBoissons(false);
        if(id !== 0) modifierCommande(id, 1);
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
        <div className='com_container'>
            <div className='com_produits_container'>
                <div className='com_produits'>
                    {(() => {
                        const produitsFiltres = produitsAffiches.filter(produit => produit.display === 1);
                        const produitsComplet = produitsFiltres.length < 8 
                            ? [...produitsFiltres, ...Array(8 - produitsFiltres.length).fill({ 
                                id_produit: null, 
                                nom: '' 
                            })] 
                            : produitsFiltres;

                        return produitsComplet.map((produit, index) => (
                            <div 
                                className={`com_produit`} 
                                onClick={() => produit.id_produit && handleClick(produit.id_produit)}
                                key={index}>
                                {produit.nom}
                            </div>
                        ));
                    })()}
                </div>
                <div className='com_prod_large_container'>
                    {produitsAffiches.filter((produit) => produit.display === -1).map((produit, index) => (
                        <div className={`com_produit com_produit_large`} 
                            onClick={() => {handleClick(produit.id_produit)}}
                            key={index}> {produit.nom} </div>
                    ))}
                </div>
            </div>
            <div className='com_details_container'>
                <div className='com_details'> 
                    <input type='text' className='com_libelle' placeholder='Nouvelle Commande' name='libelle' defaultValue={commande.libelle}/>
                    <div> 
                        <select className="com_date" name="date" value={commande.date} onChange={(e) => {setCommande((prevCommande) => ({ ...prevCommande, date: e.target.value }));}}>
                            {dates.map((date, d_index) => (
                                <option key={d_index} value={date.jour}>{formatDate(date.jour)}</option>
                            ))}
                        </select>
                        <select className='com_time' name='time' value={commande.time} onChange={(e) => {setCommande((prevCommande) => ({ ...prevCommande, time: e.target.value }));}}>
                            {tranches.map((tranche, t_index) => (
                                (tranche.is_midi === 1 && isMidiSoir["midi"] === 1) || (tranche.is_midi === 0 && isMidiSoir["soir"] === 1) ? <option key={t_index}>{tranche.tranche}</option> : ""
                            ))}
                        </select>
                    </div>
                    <hr/>

                    {produitsCommandes.map((produit, index) => (
                        <div key={index} className='com_pc_container'> 
                            <div className='com_pc'> 
                                <div> 
                                    <span className='com_remove_pc' onClick={() => modifierCommande(produit.tempId, -1)}> - </span> 
                                    <span onClick={() => {setSelectedProduct(produit); setModalCustom(true);}}>
                                        {produit.qte} x {produit.nom}
                                    </span>
                                </div> 
                                <div>{produit.prix} €</div>
                            </div>
                            {produit.modifications && produit.modifications.length > 0 ? (
                                produit.modifications.map((modif, m_index) => (
                                    <div className={`com_modification glo_modificateur_${modif.modificateur}`} key={m_index}>
                                        {modif.modificateur === -1 ? "SANS " : modif.modificateur === 1 ? "SUPPLÉMENT " : ""}{modif.nom}
                                    </div>
                                ))
                            ) : null}
                        </div>
                    ))}
                        
                        
                </div>
                <div className='com_total'>{total} €</div>
                <div className='com_message_paye'> { commande.paye !== null ? "Attention, cette commande à déjà été payée." :""} </div>
                {commandeId ? 
                    <div className='com_bt_edit'>
                        <div className='com_edit' onClick={validerCommande}> Modifier </div>
                        <div className='com_delete' onClick={() => setshowConfirm(true)}> X </div>
                    </div>
                            : 
                    <div className='com_add' onClick={validerCommande}> Ajouter </div>
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