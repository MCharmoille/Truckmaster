import React, { useState } from 'react';
import axios from 'axios';
import logo from '../img/tm_white.png';

const Connexion = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(process.env.REACT_APP_API_URL + "utilisateurs/login/", {
        identifiant: username,
        password: password
      });

      if (!response.data.success) {
        setError(response.data.message || "Identifiants incorrects.");
      } else {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', response.data.username);
        localStorage.setItem('userId', response.data.userId);
        onLogin();
      }
    } catch (err) {
      console.error(err);
      setError("Une erreur réseau ou serveur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden font-sans">

      {/* Background Decorative Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="w-full max-w-md z-10 animate-fade-in-up">

        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <img className='w-48 md:w-56 mb-2 drop-shadow-2xl' src={logo} alt="Truckmaster Logo" />
          <p className="text-slate-400 text-sm font-medium tracking-widest uppercase opacity-80">v1.5.2</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/40 backdrop-blur-2xl border border-slate-700/50 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-white mb-2">Bon retour !</h1>
            <p className="text-slate-400">Connectez-vous pour continuer</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">

            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1">Utilisateur</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-40 group-focus-within:opacity-100 transition-opacity">👤</span>
                <input
                  type="text"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-4 ring-cyan-500/10 transition-all"
                  placeholder="Votre nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1">Mot de passe</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-40 group-focus-within:opacity-100 transition-opacity">🔒</span>
                <input
                  type="password"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-4 ring-cyan-500/10 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-4 rounded-xl animate-shake">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 disabled:opacity-50 text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-cyan-500/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-8"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Se connecter <span className="text-xl">🚀</span></>
              )}
            </button>
          </form>

        </div>

        {/* Footer Credits */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Truckmaster — Réalisé par Maxime Charmoille</p>
        </div>

      </div>
    </div>
  );
};

export default Connexion;
