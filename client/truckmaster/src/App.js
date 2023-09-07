import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import Accueil from "./pages/Accueil";
import Commandes from "./pages/Commandes";
import Devis from "./pages/Devis";
import NouvelleCommande from "./pages/NouvelleCommande";
import "./style.css"

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <div className="accueil">
           <Link to="/"> Accueil </Link>
           <Link to="/commandes"> Commandes </Link>
           <Link to="/add"> Nouvelle commande </Link>
        </div>
        <div className="corps">
          <Routes>
            <Route path="/" element={<Accueil/>}/>
            <Route path="/commandes" element={<Commandes/>}/>
            <Route path="/add" element={<NouvelleCommande/>}/>
            <Route path="/devis" element={<Devis/>}/>
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
