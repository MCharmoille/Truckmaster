import React, { useState, useEffect } from 'react';
import "../bus.css";

const Bus = () => {

    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
      // Fonction pour formater la date au format "YYYY-mm-dd hh:ii"
      const formatDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 90);
  
        setCurrentDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
        setCurrentTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
      };
      formatDateTime();
    }, []);
  

    useEffect(() => {
      const intervalId = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);

      // Nettoyer l'intervalle lorsque le composant est démonté
      return () => clearInterval(intervalId);
    }, []);
    

    const formatTime = (timeInSeconds) => {
      const minutes = Math.floor(timeInSeconds / 60);
      const remainingSeconds = timeInSeconds % 60;
      return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    

  return (
    <div className='bus_img'>
      <div className='bus_datedebut'>2023-12-01</div>
      <div className='bus_datefin'>2023-12-31</div>
      <div className='bus_date'>{currentDate}</div>
      <div className='bus_time'>{currentTime}</div>
      <div className='timer'>{formatTime(seconds)}</div>


      <div className="dot dot1"></div>
      <div className="dot dot2"></div>
    </div>
  );
};

export default Bus;
