import React, { useState } from 'react';
import axios from 'axios';
import logo from '../img/tm_white.png';
import '../App.css';

const Connexion = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            await axios.post(process.env.REACT_APP_API_URL+"utilisateurs/login/", {identifiant : username, password : password})
                        .then((response) => {
                            if(!response.data){
                                setError("Attention, username ou mot de passe incorrect");
                            }
                            else {
                                localStorage.setItem('authToken', response.data.token);
                                localStorage.setItem('user', response.data.username);
                                setError("");
                                onLogin();
                            }
                        })
                        .catch((error) => {
                            console.error(error);
                        });
            
        } catch (error) {
            console.error("Une erreur s'est produite lors de la requête POST :", error);
        }
    };

  return (
    <div className="App">
      <div className="home">
        <img className='home_logo' src={logo} alt="Truckmaster Logo"/>

        <div className='con_titre'> Connectez-vous à votre compte Truckmaster pour accèder à tous les services : </div>
        <div className='con_login'>
          <form>
            <div className='con_user'>Nom d'utilisateur : 
              <input className='con_input' type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            
            <div className='con_mdp'>Mot de passe :
              <input className='con_input' type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className='con_error'>{error}</div>
            <button className='con_valider' type="button" onClick={handleLogin}>Se connecter</button>
          </form>
        </div>
        
        <div className="home_credits">
          <p>Maxime Charmoille</p>
          <p>Truckmaster v1.3</p>
        </div>
      </div>
    </div>
  );
};

export default Connexion;
