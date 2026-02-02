import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
// import { Link } from 'react-router-dom'
// import { format } from 'date-fns';
import { Page, Text, View, Document, PDFDownloadLink, Image, StyleSheet, Font } from '@react-pdf/renderer';
import logo from '../img/logo.jpg';

const Devis = () => {
    const [devis, setDevis] = useState([]);
    const [selectedDevis, setSelectedDevis] = useState(null);

    useEffect(() => {
        const fetchAllDevis = async () => {
            try {
                const res = await axios.get(process.env.REACT_APP_API_URL + "devis")
                setDevis(res.data);
            } catch (err) {
                console.log(err)
            }
        }
        fetchAllDevis()
    }, [])

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
            <Page size="A4" style={{ margin: 30, fontFamily: "Open Sans" }}>
                <View style={{ flexDirection: 'row' }}>
                    <Image src={logo} style={styles.logo} />
                    <View style={styles.infoContainer}>
                        <View style={{ width: 350 }}>{/* TO DO : si possible remplacer le width par un display flex */}
                            <Text style={{ ...styles.infoText, fontSize: 12, fontWeight: "bold" }}>Oh Truck de Séssé</Text>
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

                <View style={{ flexDirection: 'row' }}>
                    <View style={styles.infoContainer}>
                        <View style={{ width: 465 }}>{/* TO DO : si possible remplacer le width par un display flex */}
                            <Text style={{ ...styles.infoText, fontSize: 10, fontWeight: "bold" }}>À l'attention de</Text>
                            <Text style={styles.infoText}>{devis.nom}</Text>
                            <Text style={styles.infoText}>{devis.adresse}</Text>
                            <Text style={styles.infoText}>{devis.adresse_suite}</Text>
                        </View>
                        <View>
                            <Text style={styles.infoText}>Devis N° {devis.id.toString().padStart(4, '0')}</Text>
                            <Text style={styles.infoText}>Date : {devis.date_commande}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={{ width: "55%" }}>Désignation</Text>
                        <Text style={{ width: "15%" }}>Quantité</Text>
                        <Text style={{ width: "15%" }}>Prix unitaire</Text>
                        <Text style={{ width: "15%" }}>Montant TTC</Text>
                    </View>
                    {devis.devis_produits.map((produit, index) => (
                        <View style={styles.tableRow} key={index}>
                            <Text style={{ width: "55%" }}>{produit.nom}</Text>
                            <Text style={{ width: "15%" }}>{produit.quantite}</Text>
                            <Text style={{ width: "15%" }}>{produit.prix.toFixed(2) + ' €'}</Text>
                            <Text style={{ width: "15%" }}>{produit.quantite != null ? (produit.quantite * produit.prix).toFixed(2) + ' €' : produit.prix.toFixed(2) + ' €'}</Text>
                        </View>
                    ))}
                </View>

                <View>
                    <Text style={{ ...styles.infoText, fontWeight: "bold" }}>Conditions générales</Text>
                    <Text style={styles.infoText}>TVA non applicable - Article 293B du Code général des impôts</Text>
                </View>

            </Page>
        </Document>
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 gap-6">
                <h1 className="text-3xl font-black text-white">Liste des devis</h1>
                <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-emerald-500/20">
                    Créer un nouveau devis
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {devis.map(devis => (
                    <div key={devis.id} className="bg-slate-800 border border-slate-700/50 p-6 rounded-[2rem] shadow-xl flex flex-col justify-between hover:border-slate-600 transition-all group">
                        <div className="mb-6">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-slate-900 border border-slate-700 text-slate-400 px-3 py-1 rounded-lg text-xs font-black tracking-widest uppercase">
                                    N° {devis.id.toString().padStart(4, '0')}
                                </span>
                                <span className="text-slate-500 text-sm font-bold">{devis.date_commande}</span>
                            </div>
                            <h2 className="text-xl font-black text-white mb-2">{devis.nom}</h2>

                            {selectedDevis === devis.id && (
                                <div className="mt-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50 space-y-4 animate-slide-up">
                                    <input
                                        type="text"
                                        className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500 transition-all font-bold"
                                        value={devis.nom}
                                        onChange={(e) => {/* Mettre à jour la valeur du nom du devis */ }}
                                    />
                                    <input
                                        type="text"
                                        className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500 transition-all font-mono"
                                        value={devis.date_commande}
                                        onChange={(e) => {/* Mettre à jour la valeur de la date du devis */ }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-slate-700/50">
                            <button
                                className={`flex-1 py-3 rounded-xl font-bold transition-all ${selectedDevis === devis.id ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                                onClick={() => handleDevisClick(devis.id)}
                            >
                                {selectedDevis === devis.id ? 'Fermer' : 'Modifier'}
                            </button>
                            <button className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all">
                                <PDFDownloadLink document={<DevisPDF devis={devis} />} fileName={`DEVIS_${devis.id.toString().padStart(4, '0')}.pdf`}>
                                    {({ loading }) => loading ? '...' : 'PDF'}
                                </PDFDownloadLink>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Devis