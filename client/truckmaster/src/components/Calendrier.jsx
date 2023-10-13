import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Calendrier = ({ onDateChange }) => {
  const [dates, setDates] = useState([]);
  const [currentDate, setCurrentDate] = useState();

  // useCallback mémorise la fonction onDateChange pour ne pas la recréer à chaque changement de currentDate
  const memoizedOnDateChange = useCallback(
    (currentDate) => {
      onDateChange(currentDate);
      // commentaire permettant de skip le warning
      // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, []
  );
  
  useEffect(() => {
    const getDates = async() => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}dates`);
        setDates(res.data);

        const today = new Date().setHours(0, 0, 0, 0);
        const date = res.data.find(date => new Date(date.jour).setHours(0, 0, 0, 0) >= today) || res.data[res.data.length - 1];
        setCurrentDate(date);
      } catch (err) {
        console.log(err);
      }
    }
    getDates();
  }, []);

  useEffect(() => {
    console.log("ici");
    if (typeof currentDate !== "undefined") memoizedOnDateChange(currentDate);
  }, [currentDate, memoizedOnDateChange]);
    
  const changeDay = (mode) => {
    const id = dates.findIndex(date => date.jour === currentDate.jour);
    if(typeof dates[id + mode] !== "undefined")
      setCurrentDate(dates[id + mode]);
    else{
      alert("Aucune date n'existe "+(mode === 1 ? "après" : "avant")+" le "+formatDate(currentDate.jour)+". Merci d'en créer depuis le menu, onglet Gestion des dates.");
    }
  };

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="calendrier">
      <button onClick={() => changeDay(-1)}>&#8592;</button>
      <p>{currentDate ? formatDate(currentDate.jour) : ""}</p>
      <button onClick={() => changeDay(1)}>&#8594;</button>
    </div>
  );
};

export default Calendrier;
