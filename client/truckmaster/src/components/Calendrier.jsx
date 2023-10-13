import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Calendrier = ({ onDateChange }) => {
  const [dates, setDates] = useState([]);
  const [currentDate, setCurrentDate] = useState();
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
    if(typeof currentDate !== "undefined") onDateChange(currentDate);
  }, [currentDate, onDateChange]);
    
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
