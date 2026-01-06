import React, { useState, useEffect, useCallback, forwardRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/fr';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from 'date-fns/locale';

registerLocale('fr', fr);

const Calendrier = ({ onDateChange }) => {
  const [dates, setDates] = useState([]);
  const [currentDate, setCurrentDate] = useState(null);

  // Memoized callback
  const memoizedOnDateChange = useCallback(
    (currentDate) => {
      onDateChange(currentDate);
      // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, []
  );

  useEffect(() => {
    const getDates = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}dates`);

        // DEDUPLICATION STEP:
        // Use a Map to keep only the first occurrence of each date string
        const uniqueDatesMap = new Map();

        res.data.forEach(item => {
          const isoDate = moment(item.jour).format('YYYY-MM-DD');
          if (!uniqueDatesMap.has(isoDate)) {
            uniqueDatesMap.set(isoDate, item);
          }
        });

        const uniqueDates = Array.from(uniqueDatesMap.values());

        // Sort dates: Oldest first
        const sortedDates = uniqueDates.sort((a, b) => moment(a.jour).diff(moment(b.jour)));

        setDates(sortedDates);

        const today = moment().startOf('day');
        // Find date matching today, or the first date in future. 
        let initialDate = sortedDates.find(date => moment(date.jour).isSameOrAfter(today, 'day'));

        // If all are past, pick the last one (most recent).
        if (!initialDate && sortedDates.length > 0) {
          initialDate = sortedDates[sortedDates.length - 1];
        }

        setCurrentDate(initialDate);
      } catch (err) {
        console.log(err);
      }
    }
    getDates();
  }, []);

  useEffect(() => {
    if (currentDate) memoizedOnDateChange(currentDate);
  }, [currentDate, memoizedOnDateChange]);

  // Robust Date Comparison Helper (Strings)
  const getIsoDate = (d) => moment(d).format('YYYY-MM-DD');

  const changeDay = (mode) => {
    if (!currentDate || dates.length === 0) return;

    // Find index by comparing ISO strings
    const currentIso = getIsoDate(currentDate.jour);
    const currentIndex = dates.findIndex(d => getIsoDate(d.jour) === currentIso);

    if (currentIndex === -1) return;

    const newIndex = currentIndex + mode;
    if (dates[newIndex]) {
      setCurrentDate(dates[newIndex]);
    }
  };

  const formatDate = (date) => {
    // Force UTC/Local consistency by stripping time and constructing a "safe" local date at noon
    // This avoids "previous day" errors due to timezone offsets (e.g. UTC midnight -> EST previous day)
    const isoString = moment(date).format('YYYY-MM-DD'); // Moment handles the parsing robustly
    const [year, month, day] = isoString.split('-').map(Number);
    const d = new Date(year, month - 1, day, 12, 0, 0); // Noon local time

    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const handleDatePickerChange = (date) => {
    if (!date) return;
    // Flatten selection to ISO string
    const selectedIso = moment(date).format('YYYY-MM-DD');
    const typeDate = dates.find(d => getIsoDate(d.jour) === selectedIso);
    if (typeDate) {
      setCurrentDate(typeDate);
    }
  };

  // Logic for disabled buttons
  const currentIso = currentDate ? getIsoDate(currentDate.jour) : null;
  const currentIndex = currentIso ? dates.findIndex(d => getIsoDate(d.jour) === currentIso) : -1;

  const hasPrev = currentIndex > 0;
  // Ensure we don't enable 'next' if we are at the last index
  const hasNext = currentIndex !== -1 && currentIndex < dates.length - 1;

  // Custom Input for DatePicker
  // Receives 'value' from DatePicker (ignored) and 'customLabel' from us (used)
  const CustomInput = forwardRef(({ value, onClick, customLabel }, ref) => (
    <button
      className="text-2xl md:text-3xl font-bold text-white uppercase tracking-wide hover:text-emerald-400 transition-colors cursor-pointer"
      onClick={onClick}
      ref={ref}
    >
      {customLabel}
    </button>
  ));

  if (!currentDate) return null;

  return (
    <div className="flex items-center justify-between gap-4 bg-slate-900/80 rounded-3xl p-2 w-full max-w-2xl mx-auto border border-slate-700 shadow-lg relative z-50">

      <button
        onClick={() => changeDay(-1)}
        disabled={!hasPrev}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 border border-slate-700 flex-shrink-0
          ${hasPrev
            ? 'bg-slate-800 hover:bg-emerald-600 text-white hover:border-emerald-500 shadow-md active:scale-95'
            : 'bg-slate-800/50 text-slate-600 cursor-not-allowed opacity-50'
          }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <div className="flex-1 flex justify-center py-2 relative">
        <DatePicker
          selected={moment(currentDate.jour).toDate()}
          onChange={handleDatePickerChange}
          includeDates={dates.map(d => moment(d.jour).toDate())}
          locale="fr"
          customInput={<CustomInput customLabel={formatDate(currentDate.jour)} />}
          dateFormat="dddd d MMMM yyyy"
          calendarClassName="custom-datepicker"
          // Force portal to ensure it displays on top of EVERYTHING
          withPortal
          portalId="root-portal"
        />
      </div>

      <button
        onClick={() => changeDay(1)}
        disabled={!hasNext}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 border border-slate-700 flex-shrink-0
          ${hasNext
            ? 'bg-slate-800 hover:bg-emerald-600 text-white hover:border-emerald-500 shadow-md active:scale-95'
            : 'bg-slate-800/50 text-slate-600 cursor-not-allowed opacity-50'
          }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

    </div>
  );
};

export default Calendrier;
