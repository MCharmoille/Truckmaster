import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import Accueil from "./components/Accueil";
import Commandes from "./components/Commandes";
import Devis from "./components/Devis";
import NouvelleCommande from "./components/NouvelleCommande";
import Resume from "./components/Resume";
import "./style.css";
import home from './img/home.png';
import list from './img/list.png';
import plus from './img/plus.png';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <div className="accueil">
           <Link to="/"> <img src={home} alt="home" className="header_icons" /> </Link>
           <Link to="/commandes"> <img src={list} alt="list" className="header_icons" /> </Link>
           <Link to="/add"> <img src={plus} alt="plus" className="header_icons" /> </Link>
        </div>
        <div className="corps">
          <Routes>
            <Route path="/" element={<Accueil/>}/>
            <Route path="/commandes" element={<Commandes/>}/>
            <Route path="/add" element={<NouvelleCommande />} />
            <Route path="/add/:commandeId" element={<NouvelleCommande />} />
            <Route path="/devis" element={<Devis/>}/>
            <Route path="/resume" element={<Resume/>}/>
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
