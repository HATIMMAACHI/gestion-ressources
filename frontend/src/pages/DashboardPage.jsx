import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { getRessources } from "../services/ressourceService";
import { getPannes } from "../services/panneService";
import { getFournisseurs } from "../services/fournisseurService";
import { getAffectations } from "../services/affectationService";
import { ROLES } from "../config/roles";
import { 
  Package, 
  AlertTriangle, 
  Activity,
  Search,
  SlidersHorizontal,
  MoreVertical,
  TrendingUp,
  TrendingDown
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [ressources, setRessources] = useState([]);
  const [affectations, setAffectations] = useState([]);
  const [pannes, setPannes] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        if (user?.role === ROLES.ENSEIGNANT) {
          // Enseignants: récupérer uniquement leurs affectations et les pannes
          const [affData, panData] = await Promise.all([
            getAffectations({ utilisateurId: user.id, actif: true }).catch(() => []),
            getPannes().catch(() => [])
          ]);
          setAffectations(Array.isArray(affData) ? affData : []);
          setPannes(Array.isArray(panData) ? panData : []);
          setRessources([]); // Pas de ressources globales pour enseignants
        } else {
          // Autres rôles: vue complète
          const [resData, panData, fouData] = await Promise.all([
            getRessources().catch(() => []),
            getPannes().catch(() => []),
            getFournisseurs().catch(() => [])
          ]);
          setRessources(Array.isArray(resData) ? resData : []);
          setPannes(Array.isArray(panData) ? panData : []);
          setFournisseurs(Array.isArray(fouData) ? fouData : []);
        }
      } catch (e) {
        console.error("Dashboard fetching error", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  // Real Database calculations
  const totalRessources = user?.role === ROLES.ENSEIGNANT ? affectations.length : ressources.length;
  const pannesEnCours = pannes.filter(p => p.statut !== 'RESOLUE').length;
  
  let tauxDispo = 100;
  if (user?.role === ROLES.ENSEIGNANT && totalRessources > 0) {
    const dispo = affectations.filter(a => a.ressource?.etat === 'DISPONIBLE').length;
    tauxDispo = ((dispo / totalRessources) * 100).toFixed(1);
  } else if (totalRessources > 0) {
    const dispo = ressources.filter(r => r.etat === 'DISPONIBLE').length;
    tauxDispo = ((dispo / totalRessources) * 100).toFixed(1);
  }

  const getStatusBadge = (estListeNoire) => {
    if (estListeNoire) return <span className="status-badge status-badge-danger">Banni</span>;
    return <span className="status-badge status-badge-success">Actif</span>;
  };

  return (
    <div className="space-y-6">
      {/* 3 Columns Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pro-card p-6 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-full bg-[var(--violet-light)] text-[var(--violet)] flex items-center justify-center">
              <Package size={20} />
            </div>
            <div className="flex items-center gap-1 text-[var(--green)] bg-[var(--green-bg)] px-2 py-1 rounded-md text-xs font-bold">
              <TrendingUp size={14} /> {user?.role === ROLES.ENSEIGNANT ? "Affectations" : "Base de données"}
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">{loading ? "-" : totalRessources}</h3>
            <p className="text-[var(--text-secondary)] text-sm font-semibold mt-1">{user?.role === ROLES.ENSEIGNANT ? "Mes Ressources Affectées" : "Total ressources"}</p>
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="pro-card p-6 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-full bg-[var(--red-bg)] text-[var(--red)] flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div className="flex items-center gap-1 text-[var(--red)] bg-[var(--red-bg)] px-2 py-1 rounded-md text-xs font-bold">
              <TrendingDown size={14} /> Action requise
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">{loading ? "-" : pannesEnCours}</h3>
            <p className="text-[var(--text-secondary)] text-sm font-semibold mt-1">Pannes signalées</p>
          </div>
        </motion.div>

        {/* Card 3 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="pro-card p-6 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-full bg-[var(--orange-bg)] text-[var(--orange)] flex items-center justify-center">
              <Activity size={20} />
            </div>
            <div className="flex -space-x-2">
              {['R','C','T'].map((initial, i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-[var(--violet-light)] text-[var(--violet)] text-[10px] font-bold flex items-center justify-center z-10">
                  {initial}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">{loading ? "-" : `${tauxDispo}%`}</h3>
            <p className="text-[var(--text-secondary)] text-sm font-semibold mt-1">Disponibilité matérielle</p>
          </div>
        </motion.div>

      </div>

      {/* Data Table Section - Only visible to authorized roles */}
      {(user?.role === ROLES.RESPONSABLE || user?.role === ROLES.CHEF_DEPT) && (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pro-card flex flex-col">
        <div className="p-6 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Réseau Partenaires & Utilisateurs</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-[var(--text-muted)]" />
              </div>
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="h-[40px] w-[240px] rounded-[var(--radius-sm)] border border-[var(--border)] bg-white pl-9 pr-4 text-sm outline-none focus:border-[var(--violet)] transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="pro-table-wrapper rounded-none border-0 shadow-none">
          <table className="w-full">
            <thead>
              <tr>
                <th className="w-1/3">Société / Nom</th>
                <th>Gérant</th>
                <th>Statut</th>
                <th>Site Web / Contact</th>
                <th className="text-right w-16"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-[var(--text-muted)]">Chargement de la base de données...</td>
                </tr>
              ) : fournisseurs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-[var(--text-muted)]">Aucun fournisseur enregistré.</td>
                </tr>
              ) : (
                fournisseurs.slice(0, 8).map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[var(--violet-light)] text-[var(--violet)] font-bold flex items-center justify-center shrink-0 text-sm">
                          {row.nomSociete ? row.nomSociete.charAt(0).toUpperCase() : "F"}
                        </div>
                        <span className="font-bold text-[var(--text-primary)]">{row.nomSociete || "Inconnu"}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-[var(--text-secondary)]">{row.gerant || "-"}</span>
                    </td>
                    <td>
                      {getStatusBadge(row.estListeNoire)}
                    </td>
                    <td>
                      <span className="text-[var(--text-secondary)] text-sm">{row.siteWeb || "Non spécifié"}</span>
                    </td>
                    <td className="text-right">
                      <Link to="/metier/fournisseurs" className="p-2 text-[var(--text-muted)] hover:text-[var(--violet)] rounded-lg hover:bg-[var(--violet-light)] transition-colors inline-block">
                        <MoreVertical size={16} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-[var(--border)] flex items-center justify-center">
           <Link to="/metier/fournisseurs" className="text-[var(--violet)] font-bold text-sm hover:underline">Accéder au répertoire complet</Link>
        </div>
      </motion.div>
      )}
    </div>
  );
}
