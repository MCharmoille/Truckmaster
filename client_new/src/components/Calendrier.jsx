import React, { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import moment from 'moment';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../api.js';
import { aujourdhui, datePourCalendrier, formatJourComplet, jourIso } from '../date.js';
import AucunJour from './AucunJour.jsx';

registerLocale('fr', fr);

const Calendrier = ({ onDateChange, dateDemandee, onDisponible }) => {
  const [dates, setDates] = useState([]);
  const [currentDate, setCurrentDate] = useState(null);
  const [connu, setConnu] = useState(false);
  const [rechargement, setRechargement] = useState(0);
  const dateDemandeeRef = useRef(dateDemandee);
  const onDisponibleRef = useRef(onDisponible);
  dateDemandeeRef.current = dateDemandee;
  onDisponibleRef.current = onDisponible;

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
        const res = await api.get('dates');

        // DEDUPLICATION STEP:
        // Use a Map to keep only the first occurrence of each date string
        const uniqueDatesMap = new Map();

        res.data.forEach(item => {
          const isoDate = jourIso(item.jour);
          if (!uniqueDatesMap.has(isoDate)) {
            uniqueDatesMap.set(isoDate, item);
          }
        });

        const uniqueDates = Array.from(uniqueDatesMap.values());

        // Sort dates: Oldest first
        const sortedDates = uniqueDates.sort((a, b) => moment(a.jour).diff(moment(b.jour)));

        setDates(sortedDates);
        setConnu(true);
        onDisponibleRef.current?.(sortedDates.length > 0);

        const demandee = dateDemandeeRef.current
        let initialDate = demandee
          ? sortedDates.find(date => jourIso(date.jour) === demandee)
          : null;

        if (!initialDate) {
          initialDate = sortedDates.find(date => jourIso(date.jour) >= aujourdhui());

          // If all are past, pick the last one (most recent).
          if (!initialDate && sortedDates.length > 0) {
            initialDate = sortedDates[sortedDates.length - 1];
          }
        }

        setCurrentDate(initialDate || null);
      } catch (err) {
        console.log(err);
      }
    }
    getDates();
  }, [rechargement]);

  useEffect(() => {
    if (currentDate) memoizedOnDateChange(currentDate);
  }, [currentDate, memoizedOnDateChange]);

  const getIsoDate = (d) => jourIso(d);

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

  const handleDatePickerChange = (date) => {
    if (!date) return;
    // Flatten selection to ISO string
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    const jour = String(date.getDate()).padStart(2, '0');
    const selectedIso = `${date.getFullYear()}-${mois}-${jour}`;
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

  if (!currentDate) {
    if (connu && dates.length === 0) {
      return <AucunJour onCree={() => setRechargement((n) => n + 1)} />;
    }
    return null;
  }

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
        <ChevronLeft className="w-8 h-8" />
      </button>

      <div className="flex-1 flex justify-center py-2 relative">
        <DatePicker
          selected={datePourCalendrier(currentDate.jour)}
          onChange={handleDatePickerChange}
          includeDates={dates.map(d => datePourCalendrier(d.jour))}
          locale="fr"
          customInput={<CustomInput customLabel={formatJourComplet(currentDate.jour)} />}
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
        <ChevronRight className="w-8 h-8" />
      </button>

    </div>
  );
};

export default Calendrier;
