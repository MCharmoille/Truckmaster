import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import Accueil from "./components/Accueil";
import Commandes from "./components/Commandes";
import Devis from "./components/Devis";
import NouvelleCommande from "./components/NouvelleCommande";
import Resume from "./components/Resume";
import PenseBete from "./components/PenseBete";
import Parametres from "./components/Parametres";
import Bus from "./components/Bus";
import "./style.css";
import home from './img/home.png';
import list from './img/list.png';
import plus from './img/plus.png';
// import params from './img/parametres.png';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <div className="accueil">
           <Link to="/"> <img src={home} alt="home" className="header_icons" /> </Link>
           <Link to="/commandes"> <img src={list} alt="list" className="header_icons" /> </Link>
           <Link to="/add"> <img src={plus} alt="plus" className="header_icons" /> </Link>
           {/* <Link to="/parametres"> <img src={params} alt="params" className="header_icons" style={{ float: "right", marginRight: "10px" }}/> </Link> */}
        </div>
        <div className="corps">
          <Routes>
            <Route path="/" element={<Accueil/>}/>
            <Route path="/commandes" element={<Commandes/>}/>
            <Route path="/add" element={<NouvelleCommande />} />
            <Route path="/add/:commandeId" element={<NouvelleCommande />} />
            <Route path="/devis" element={<Devis/>}/>
            <Route path="/resume" element={<Resume/>}/>
            <Route path="/pensebete" element={<PenseBete/>}/>
            <Route path="/parametres" element={<Parametres/>}/>
            <Route path="/bus" element={<Bus/>}/>
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
