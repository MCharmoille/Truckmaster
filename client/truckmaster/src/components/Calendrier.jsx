import React, { useState, useEffect } from 'react';

const Calendrier = ({ onDateChange }) => {
    const getNextFriday = () => {
      const today = new Date();
      const daysUntilFriday = 5 - today.getDay(); // Jours restants jusqu'au vendredi (0 pour vendredi).
      const nextFriday = new Date(today);
      nextFriday.setDate(today.getDate() + daysUntilFriday);
      return nextFriday;
    };

    const [currentDate, setCurrentDate] = useState(getNextFriday());

    useEffect(() => {
        onDateChange(currentDate);
      }, [currentDate, onDateChange]);
    
  const handlePrevDay = () => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(currentDate.getDate() - 7); // Déplacez-vous de 7 jours en arrière (une semaine).
    while (prevDate.getDay() !== 5) {
      // Recherchez le vendredi précédent.
      prevDate.setDate(prevDate.getDate() - 1);
    }
    setCurrentDate(prevDate);
  };

  const handleNextDay = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 7); // Déplacez-vous de 7 jours en avant (une semaine).
    while (nextDate.getDay() !== 5) {
      // Recherchez le prochain vendredi.
      nextDate.setDate(nextDate.getDate() + 1);
    }
    setCurrentDate(nextDate);
  };

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="calendrier">
      <button onClick={handlePrevDay}>&#8592;</button>
      <p>{formatDate(currentDate)}</p>
      <button onClick={handleNextDay}>&#8594;</button>
    </div>
  );
};

export default Calendrier;
