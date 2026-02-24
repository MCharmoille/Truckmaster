import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import moment from 'moment';

// Register fonts
Font.register({
    family: 'Open Sans',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 600 },
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf', fontWeight: 700 }
    ]
});

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Open Sans',
        fontSize: 10,
        color: '#333',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottom: '2pt solid #000',
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    metaContainer: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 30,
    },
    metaBox: {
        border: '1pt solid #000',
        padding: 5,
        minWidth: 100,
    },
    metaLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    metaValue: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    table: {
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#eee',
        borderBottom: '1pt solid #000',
        borderTop: '1pt solid #000',
        fontWeight: 'bold',
        paddingVertical: 5,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '0.5pt solid #ccc',
        paddingVertical: 4,
    },
    stripedRow: {
        backgroundColor: '#f9f9f9',
    },
    colDate: { width: '15%' },
    colInvoice: { width: '15%' },
    colClient: { width: '20%' },
    colNature: { width: '25%' },
    colMethod: { width: '10%' },
    colAmount: { width: '15%', textAlign: 'right' },
    footer: {
        marginTop: 30,
        borderTop: '1pt solid #000',
        paddingTop: 10,
        alignItems: 'flex-end',
    },
    footerLabel: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    footerValue: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 5,
        border: '1pt solid #000',
        padding: 5,
        minWidth: 120,
        textAlign: 'right',
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

const RecettePDF = ({ data, month, year }) => {
    const totalVentes = data.reduce((acc, curr) => acc + curr.total, 0);
    const monthName = moment().month(parseInt(month) - 1).format('MMMM');

    const formatCurrency = (amount) => {
        return amount.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>RECETTES</Text>
                </View>

                <View style={styles.metaContainer}>
                    <View style={styles.metaBox}>
                        <Text style={styles.metaLabel}>Mois :</Text>
                        <Text style={styles.metaValue}>{monthName.toUpperCase()}</Text>
                    </View>
                    <View style={styles.metaBox}>
                        <Text style={styles.metaLabel}>Année :</Text>
                        <Text style={styles.metaValue}>{year}</Text>
                    </View>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.colDate}>Date</Text>
                        <Text style={styles.colInvoice}>N° de facture</Text>
                        <Text style={styles.colClient}>Nom du client</Text>
                        <Text style={styles.colNature}>Nature de la recette</Text>
                        <Text style={styles.colMethod}>Mode</Text>
                        <Text style={styles.colAmount}>Montant (€)</Text>
                    </View>

                    {data.map((row, index) => (
                        <View key={index} style={[styles.tableRow, index % 2 === 1 ? styles.stripedRow : {}]}>
                            <Text style={styles.colDate}>{moment(row.date_commande).format('DD/MM/YY')}</Text>
                            <Text style={styles.colInvoice}></Text>
                            <Text style={styles.colClient}>{row.libelle}</Text>
                            <Text style={styles.colNature}></Text>
                            <Text style={styles.colMethod}>
                                {row.moyen_paiement === 'c' ? 'CB' :
                                    row.moyen_paiement === 'm' ? 'Esp' :
                                        row.moyen_paiement === 'h' ? 'Chq' :
                                            row.moyen_paiement === 'v' ? 'Vir' : ''}
                            </Text>
                            <Text style={styles.colAmount}>{row.total.toFixed(2)}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerLabel}>Total mensuel des Recettes :</Text>
                    <Text style={styles.footerValue}>{formatCurrency(totalVentes)} €</Text>
                </View>

                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                    `${pageNumber} / ${totalPages}`
                )} fixed />
            </Page>
        </Document>
    );
};

export default RecettePDF;
