import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { Link } from 'react-router-dom';

const Statistiques = () => {
    const [data, setData] = useState([]);
    const [inclureOffert, setInclureOffer] = useState(false);
    const [inclureNonPaye, setInclureNonPaye] = useState(false);

    useEffect(() => {
        const fetchCommandesForDate = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}commandes/statistiques`);
                setData(res.data.statistiques);
            } catch (err) {
                console.log(err);
            }
        };
        fetchCommandesForDate();
    }, []);

    const getTotalForMonth = (paiements) => {
        return paiements.reduce((total, paiement) => {
            if ((paiement.nom === 'Offert' && inclureOffert) || 
                (paiement.nom === 'Non payé' && inclureNonPaye) || 
                (paiement.nom !== 'Offert' && paiement.nom !== 'Non payé')) {
                return total + paiement.valeur;
            }
            return total;
        }, 0);
    };

    return (
        <div>
            <div className='stat_options'>
                <input className='stat_cb' type="checkbox" checked={inclureOffert} onChange={() => setInclureOffer(!inclureOffert)} />
                Inclure offert
                <input className='stat_cb' type="checkbox" checked={inclureNonPaye} onChange={() => setInclureNonPaye(!inclureNonPaye)} />
                Inclure non payé
                <Link to="/resume"> <button className='stat_btn_retour'> Retour </button> </Link> 
            </div>

            <div className='stat_totaux'>
                {data.map((monthData, index) => (
                    <div key={index} className='stat_total'>
                        <h3>{moment(monthData.mois, 'YYYY-MM').format('MMMM YYYY').replace(/^\w/, (c) => c.toUpperCase())}</h3>
                        <p>Total: <b> {getTotalForMonth(monthData.paiements)} € </b></p>
                        <ul>
                            {monthData.paiements.map((paiement) => (
                                <li key={paiement.id}>
                                    {paiement.nom}: <b>{paiement.valeur} € </b> 
                                </li>
                            ))}
                        </ul>
                        <br/>
                    </div>
                ))}
            </div>

            <div className='stat_graph'>
                Graphique de l'évolution mois par mois <i>(Bientôt !)</i>
            </div>
            
        </div>
    );
};

export default Statistiques;
