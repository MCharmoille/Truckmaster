import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import moment from 'moment';

// Register fonts
Font.register({
    family: 'Open Sans',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 600 }
    ]
});

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: "Open Sans",
        fontSize: 9,
        color: '#333',
    },
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
        width: '100%',
        marginTop: 20,
        marginBottom: 20
    },
    table: {
        display: 'table',
        width: '100%',
        marginTop: 20,
        marginBottom: 30,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        backgroundColor: '#F0F0F0',
        padding: 8
    },
    tableHeaderLabel: {
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: '#EEE',
        padding: 8,
    },
    footerContainer: {
        marginTop: 'auto',
    },
    pageNumber: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 10,
        color: '#777',
    }
});

const DevisPDF = ({ devis, user }) => {
    const formatCurrency = (amount) => {
        if (amount == null) return "0.00";
        return Number(amount).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    const formatDate = (date) => {
        if (!date) return "";
        return moment(date).format('DD/MM/YYYY');
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {user?.logo ? (
                        <Image
                            src={`${(process.env.REACT_APP_API_URL || '').replace(/\/$/, '')}/uploads/${user.logo}`}
                            style={styles.logo}
                        />
                    ) : (
                        <View style={styles.logo} />
                    )}
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ ...styles.infoText, fontSize: 12, fontWeight: "bold" }}>{user?.nom}</Text>
                        <Text style={styles.infoText}>{user?.adresse}</Text>
                        <Text style={styles.infoText}>{user?.adresse_suite}</Text>
                        <Text style={styles.infoText}>{user?.tel}</Text>
                        <Text style={styles.infoText}>{user?.mail}</Text>
                        <Text style={{ ...styles.infoText, marginTop: 5 }}>Siret : {user?.siret}</Text>
                    </View>
                </View>

                <View style={styles.horizontalLine} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }}>
                    <View>
                        <Text style={{ ...styles.infoText, fontSize: 10, fontWeight: "bold", marginBottom: 5 }}>À l'attention de :</Text>
                        <Text style={{ ...styles.infoText, fontSize: 11, fontWeight: "bold" }}>{devis.nom}</Text>
                        <Text style={styles.infoText}>{devis.adresse}</Text>
                        <Text style={styles.infoText}>{devis.adresse_suite}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ ...styles.infoText, fontSize: 14, fontWeight: 'bold' }}>DEVIS N° {devis.id.toString().padStart(4, '0')}</Text>
                        <Text style={styles.infoText}>Date : {formatDate(devis.date_commande)}</Text>
                    </View>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={{ width: "55%", fontWeight: 'bold' }}>Désignation</Text>
                        <Text style={{ width: "15%", textAlign: 'center', fontWeight: 'bold' }}>Quantité</Text>
                        <Text style={{ width: "15%", textAlign: 'right', fontWeight: 'bold' }}>Prix unitaire</Text>
                        <Text style={{ width: "15%", textAlign: 'right', fontWeight: 'bold' }}>Montant TTC</Text>
                    </View>
                    {devis.devis_produits && devis.devis_produits.map((produit, index) => (
                        <View style={styles.tableRow} key={index}>
                            <Text style={{ width: "55%" }}>{produit.nom_produit}</Text>
                            <Text style={{ width: "15%", textAlign: 'center' }}>{produit.quantite}</Text>
                            <Text style={{ width: "15%", textAlign: 'right' }}>{formatCurrency(produit.prix)} €</Text>
                            <Text style={{ width: "15%", textAlign: 'right' }}>
                                {formatCurrency(produit.quantite != null ? (produit.quantite * produit.prix) : produit.prix)} €
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={{ marginTop: 20 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 2 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 12 }}>TOTAL TTC : </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 12, border: '1pt solid #000', padding: 5, minWidth: 120, textAlign: 'right' }}>
                            {formatCurrency(devis.devis_produits ? devis.devis_produits.reduce((acc, p) => acc + (p.quantite ? p.quantite * p.prix : p.prix), 0) : 0)} €
                        </Text>
                    </View>
                </View>

                <View style={styles.footerContainer}>
                    <Text style={{ ...styles.infoText, fontWeight: "bold", marginTop: 40 }}>Conditions générales :</Text>
                    <Text style={styles.infoText}>TVA non applicable - Article 293B du Code général des impôts</Text>
                </View>

                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                    `${pageNumber} / ${totalPages}`
                )} fixed />
            </Page>
        </Document>
    );
};

export default DevisPDF;
