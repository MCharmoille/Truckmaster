import { React, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import fr from 'date-fns/locale/fr';

const Parametres = ({isLoggedIn, setIsLoggedIn}) => {
  const navigate = useNavigate();
  const [dates, setDates] = useState([]);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    navigate("/");
  };

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('fr-FR', options);
  };

  const getDates = async() => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}dates`);
      setDates(res.data.reverse());
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    getDates();
  }, []);

  const addDate = async(date) => {
    try {
      await axios.post(process.env.REACT_APP_API_URL+"dates/addDate", {jour : date, cb_midi : 1, cb_soir : 1});
      getDates();
      setCalendarOpen(false);
    } catch (error) {
      console.error("Une erreur s'est produite lors de l'ajout de la date :", error);
    }
  };

  const deleteDate = async(date) => {
    try {
      await axios.post(process.env.REACT_APP_API_URL+"dates/deleteDate", {id_date : date.id_date});
      getDates();
    } catch (error) {
      console.error("Une erreur s'est produite lors de la suppression d'une date :", error);
    }
  };

  const checkCb = async(date, event) => {
    try {
      await axios.post(process.env.REACT_APP_API_URL+"dates/updateCb", {id_date : date.id_date, cb : [event.target.name], checked : event.target.checked});
      getDates();
    } catch (error) {
      console.error("Une erreur s'est produite lors de la requête POST :", error);
    }
  };

  return (
    <div>
        <div className='par_section_title'> -- Jours travaillés : </div>
        <div className='par_section'>
          <button onClick={() => setCalendarOpen(!calendarOpen)} className='par_add_date'> + Ajouter une date </button>
          {calendarOpen && (
            <DatePicker
              onChange={addDate}
              inline
              locale={fr}
            />
          )}
          <table className="par_date_table">
            <thead><tr><th></th><th>Midi</th><th>Soir</th></tr></thead>
            <tbody>
              {dates.map((date, d_index) => (
                <tr key={d_index} className="par_date_row">
                  <td className="par_date_cell">{formatDate(date.jour)}</td>
                  <td className="par_date_cell"><input type="checkbox" name="cb_midi" checked={date.cb_midi} onChange={(e) => checkCb(date, e)}/></td>
                  <td className="par_date_cell"><input type="checkbox" name="cb_soir" checked={date.cb_soir} onChange={(e) => checkCb(date, e)}/></td>
                  <td className="par_date_cell">
                    <button className="par_date_delete" onClick={(e) => { deleteDate(date); }}> X </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
        </div> 
        
        <div className='par_section_title'> -- Tranches horaires : <i>( Bientôt ! )</i></div>
        <div className='par_section' hidden>
          Midi : 
          Soir : 
        </div>

        <div className='par_section_title'> -- Couleurs de l'application : <i>( Bientôt ! )</i></div>
        <div className='par_section' hidden>
          Retrait d'un ingrédient :
          Ajout d'un ingrédient :
          Produit avec un prix modifié : 
        </div>

        <div> <button onClick={handleLogout} className='par_logout'> Se déconnecter</button>  </div>
    </div>
  );
};

export default Parametres;