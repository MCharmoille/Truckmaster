import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
// import { Link } from 'react-router-dom'
import { format } from 'date-fns';
import { Page, Text, View, Document, PDFDownloadLink, Image, StyleSheet, Font} from '@react-pdf/renderer';
import logo from '../img/logo.jpg';

const Devis = () => {
    const [devis, setDevis] = useState([]);
    const [selectedDevis, setSelectedDevis] = useState(null);

    useEffect(()=>{
        const fetchAllDevis = async ()=>{
            try{
                const res = await axios.get("http://localhost:8800/devis")
                setDevis(res.data);
            }catch(err){
                console.log(err)
            }
        }
        fetchAllDevis()
    },[])

    const handleDevisClick = (devisId) => {
        if (selectedDevis === devisId) {
            setSelectedDevis(null);
        } else {
            setSelectedDevis(devisId);
        }
    };

    const styles = StyleSheet.create({
        logo: {
            width: 114,
            height: 72
        },
        infoContainer: {
            flexDirection: 'row',
            alignItems: 'center'
        },
        infoText: {
            fontSize: 9,
            marginBottom: 2
        },
        horizontalLine: {
            borderBottom: '1pt solid lightgrey',
            width: '90%',
            marginTop: 30,
            marginBottom: 30
        },
        table: {
            display: 'table',
            width: '90%',
            marginTop: 30,
            marginBottom: 30,
            fontSize: 9,
          },
          tableHeader: {
            flexDirection: 'row',
            borderBottomWidth: 0.5,
            backgroundColor: '#F0F0F0',
            fontWeight: 'bold',
            padding: 10
          },
          tableRow: {
            flexDirection: 'row',
            borderTopWidth: 0.5,
            padding: 8,
          },
    });

    Font.register({
        family: 'Open Sans',
        fonts: [
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 600 }
        ]
    });

    const DevisPDF = ({ devis }) => (
        <Document>
            <Page size="A4" style={{margin: 30, fontFamily:"Open Sans"}}>
            <View style={{flexDirection: 'row'}}>
                <Image src={logo} style={styles.logo} />
                <View style={styles.infoContainer}>
                    <View style={{width: 350}}>{/* TO DO : si possible remplacer le width par un display flex */}
                        <Text style={{ ...styles.infoText, fontSize: 12, fontWeight: "bold"}}>Oh Truck de Séssé</Text>
                        <Text style={styles.infoText}>4, rue derrière les vergers</Text>
                        <Text style={styles.infoText}>25360 GONSANS</Text>
                        <Text style={styles.infoText}>06 84 05 51 67</Text>
                        <Text style={styles.infoText}>ohtruckdesesse@gmail.com</Text>
                    </View>
                    <View>
                        <Text style={styles.infoText}>EI Siret</Text>
                        <Text style={styles.infoText}>91383681300018</Text>
                    </View>
                </View>
            </View>
            <View style={styles.horizontalLine} />

            <View style={{flexDirection: 'row'}}>
                <View style={styles.infoContainer}>
                    <View style={{width: 465}}>{/* TO DO : si possible remplacer le width par un display flex */}
                        <Text style={{ ...styles.infoText, fontSize: 10, fontWeight: "bold"}}>À l'attention de</Text>
                        <Text style={styles.infoText}>{devis.nom}</Text>
                        <Text style={styles.infoText}>{devis.adresse}</Text>
                        <Text style={styles.infoText}>{devis.adresse_suite}</Text>
                    </View>
                    <View>
                        <Text style={styles.infoText}>Devis N° {devis.id.toString().padStart(4, '0')}</Text>
                        <Text style={styles.infoText}>Date : {format(new Date(devis.date_creation), 'dd/MM/yyyy')}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={{width:"55%"}}>Désignation</Text>
                    <Text style={{width:"15%"}}>Quantité</Text>
                    <Text style={{width:"15%"}}>Prix unitaire</Text>
                    <Text style={{width:"15%"}}>Montant TTC</Text>
                </View>
                {devis.devis_produits.map((produit, index) => (
                    <View style={styles.tableRow} key={index}>
                    <Text style={{width:"55%"}}>{produit.nom}</Text>
                    <Text style={{width:"15%"}}>{produit.quantite}</Text>
                    <Text style={{width:"15%"}}>{produit.prix.toFixed(2) + ' €'}</Text>
                    <Text style={{width:"15%"}}>{produit.quantite!=null?(produit.quantite * produit.prix).toFixed(2) + ' €':produit.prix.toFixed(2) + ' €'}</Text>
                    </View>
                ))}
            </View>

            <View>
                <Text style={{ ...styles.infoText, fontWeight: "bold"}}>Conditions générales</Text>
                <Text style={styles.infoText}>TVA non applicable - Article 293B du Code général des impôts</Text>
            </View>

            </Page>
        </Document>
    );

    return (
        <div>
            <h1>Liste des devis</h1>
            <button>Créer un nouveau devis</button>
            <div>
                {devis.map(devis=>(
                    <div className='devis' key={devis.id}>
                        <div className={`devis-header ${selectedDevis === devis.id ? 'active' : ''}`}>
                            Devis {devis.id.toString().padStart(4, '0')} pour {devis.nom} ({format(new Date(devis.date_creation), 'dd/MM/yyyy')})
                            {selectedDevis === devis.id && (
                            <div className="devis-details">
                                <input type="text" value={devis.nom} onChange={(e) => {/* Mettre à jour la valeur du nom du devis */}} />
                                <input type="text" value={format(new Date(devis.date_creation), 'dd/MM/yyyy')} onChange={(e) => {/* Mettre à jour la valeur de la date du devis */}} />
                                {/* Autres champs du formulaire */}
                            </div>
                            )}
                        </div>
                        <button className={`modifier-button ${selectedDevis === devis.id ? 'active' : ''}`} onClick={() => handleDevisClick(devis.id)}>
                            Modifier
                        </button>
                        <button>
                            <PDFDownloadLink document={<DevisPDF devis={devis} />} fileName={`DEVIS_${devis.id.toString().padStart(4, '0')}.pdf`}>
                                {({loading}) => loading ? 'Chargement' : 'PDF'}
                            </PDFDownloadLink>
                        </button>
                    </div>
                ))}
            </div>
            {/* <button>
                <Link to="/add"> Ajouter une nouvelle commande </Link>
            </button> */}
        </div>
    )
}

export default Devis