import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  cloreAppelOffre,
  createAppelOffre,
  getAffectationsPrevues,
  getAppelOffreById,
  getAppelsOffre,
} from "../services/appelOffreService";
import { getBesoins } from "../services/besoinService";
import { selectionnerMoinsDisant } from "../services/offreService";
import { formatIdCell, formatRef } from "../utils/idDisplay";
import { parseApiError } from "../utils/validation";
import { useAuth } from "../contexts/AuthContext";
import { ROLES } from "../config/roles";
import { Calendar, FileText, CheckCircle, PackageSearch, Award, ShieldAlert, ArrowRight } from "lucide-react";

export default function AppelsOffrePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canCreateAndClose = user?.role === ROLES.RESPONSABLE;
  const canViewAffectationsPrevues = user?.role === ROLES.RESPONSABLE;
  const isFournisseur = user?.role === ROLES.FOURNISSEUR;

  const [items, setItems] = useState([]);
  const [besoinsDisponibles, setBesoinsDisponibles] = useState([]);
  const [details, setDetails] = useState(null);
  const [affectationsPrevues, setAffectationsPrevues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedBesoinIds, setSelectedBesoinIds] = useState([]);
  const [dateFin, setDateFin] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [showForm, setShowForm] = useState(false);

  const appelsOuverts = useMemo(
    () => {
      console.log("DEBUG: Appels d'offre reçus:", items);
      return items; // On affiche tout pour débugger
    },
    [items]
  );

  async function loadAppelsOffre() {
    setLoading(true);
    setError("");
    try {
      const data = await getAppelsOffre();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(parseApiError(err, "Impossible de charger les appels d'offre."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppelsOffre();
    if (canCreateAndClose) {
      loadBesoinsDisponibles();
    }
  }, []);

  function handleRespond(item) {
    navigate("/metier/offres", {
      state: {
        appelOffreId: item.id,
        appelOffreLabel: item.dateFin
          ? `${formatRef("AO", item.id)} - jusqu'au ${item.dateFin}`
          : formatRef("AO", item.id),
      },
    });
  }

  async function loadBesoinsDisponibles() {
    try {
      const data = await getBesoins();
      const besoins = Array.isArray(data) ? data : [];
      setBesoinsDisponibles(besoins.filter((item) => !item.appelOffreId));
    } catch {
      setBesoinsDisponibles([]);
    }
  }

  function handleBesoinSelection(event) {
    const values = Array.from(event.target.selectedOptions).map(
      (option) => option.value
    );
    setSelectedBesoinIds(values);
  }

  async function submitForm(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (selectedBesoinIds.length === 0) {
        setError("Sélectionnez au moins un besoin.");
        return;
      }
      if (!dateFin) {
        setError("Date de fin requise.");
        return;
      }

      await createAppelOffre({ besoinIds: selectedBesoinIds, dateFin });
      setSelectedBesoinIds([]);
      setDateFin("");
      setSuccess("Appel d'offre créé avec succès.");
      setShowForm(false);
      await loadAppelsOffre();
      await loadBesoinsDisponibles();
    } catch (err) {
      setError(parseApiError(err, "Création impossible."));
    } finally {
      setLoading(false);
    }
  }

  async function showDetails(id) {
    setLoading(true);
    setError("");
    try {
      const data = await getAppelOffreById(id);
      setDetails(data);
      setSelectedId(id);
    } catch (err) {
      setError(parseApiError(err, "Chargement du détail impossible."));
    } finally {
      setLoading(false);
    }
  }

  async function showAffectationsPrevues(id) {
    setLoading(true);
    setError("");
    try {
      const data = await getAffectationsPrevues(id);
      setAffectationsPrevues(Array.isArray(data) ? data : []);
      setSelectedId(id);
    } catch (err) {
      setError(parseApiError(err, "Chargement des affectations impossible."));
    } finally {
      setLoading(false);
    }
  }

  async function handleClore(id) {
    if (!window.confirm("Clore cet appel d'offre ?")) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await cloreAppelOffre(id);
      setSuccess("Appel d'offre clos avec succès.");
      await loadAppelsOffre();
      if (selectedId === id) {
        setDetails(null);
        setAffectationsPrevues([]);
      }
    } catch (err) {
      setError(parseApiError(err, "Clôture impossible."));
    } finally {
      setLoading(false);
    }
  }

  async function handleCloreEtSelectionner(id) {
    if (!window.confirm("Clore cet appel et sélectionner l'offre la moins disante ?")) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await selectionnerMoinsDisant(id);
      setSuccess("Appel clos et offre sélectionnée avec succès.");
      await loadAppelsOffre();
      if (selectedId === id) await showDetails(id);
    } catch (err) {
      setError(parseApiError(err, "Sélection automatique impossible."));
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "OUVERT": return <span className="status-badge status-badge-success">{status}</span>;
      case "CLOS": return <span className="status-badge status-badge-danger">{status}</span>;
      default: return <span className="status-badge status-badge-warning">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">
            {isFournisseur ? "Appels d'Offres Disponibles" : "Appels d'offre"}
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            {isFournisseur
              ? "Parcourez les offres ouvertes et répondez aux besoins de la faculté."
              : "Créez, consultez et clôturez vos appels d'offres pour l'acquisition de nouveau matériel."}
          </p>
        </div>
        {!isFournisseur && canCreateAndClose && (
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="pro-button shrink-0 shadow-[var(--violet)] shadow-sm"
          >
            <Calendar size={18} /> {showForm ? "Fermer" : "Nouvel Appel d'Offre"}
          </button>
        )}
      </div>

      {!isFournisseur && (
        <div className="flex gap-4">
           <div className="px-5 py-3 rounded-[var(--radius-lg)] bg-white border border-[var(--border)] shadow-[var(--shadow)] flex flex-col items-center min-w-[100px]">
            <span className="text-2xl font-black text-[var(--violet)]">{items.length}</span>
            <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Total</span>
          </div>
          <div className="px-5 py-3 rounded-[var(--radius-lg)] bg-white border border-[var(--border)] shadow-[var(--shadow)] flex flex-col items-center min-w-[100px]">
            <span className="text-2xl font-black text-[var(--green)]">{appelsOuverts.length}</span>
            <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Ouverts</span>
          </div>
        </div>
      )}

      {error && <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold">{error}</div>}
      {success && <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm font-semibold">{success}</div>}

      {isFournisseur ? (
        <div className="pro-card p-6 border-l-4 border-l-blue-500">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <PackageSearch className="text-blue-500" size={20} />
            Opportunités ouvertes
          </h3>
          {appelsOuverts.length === 0 ? (
            <div className="text-center p-8 text-slate-500 bg-slate-50 rounded-lg border border-slate-100">
              <ShieldAlert className="mx-auto mb-2 text-slate-400" size={32} />
              <p className="font-medium">Aucun appel d'offre ouvert pour le moment.</p>
            </div>
          ) : (
            <div className="pro-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Date fin</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appelsOuverts.map((item) => (
                    <tr key={item.id}>
                      <td><span className="font-mono text-slate-500 font-bold">{formatRef("AO", item.id)}</span></td>
                      <td><span className="font-medium">{item.dateFin || "-"}</span></td>
                      <td>{getStatusBadge(item.statut)}</td>
                      <td>
                        <button className="pro-button py-2 px-4 text-xs flex items-center gap-2" onClick={() => handleRespond(item)}>
                          Répondre <ArrowRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {canCreateAndClose && showForm && (
        <div className="pro-card p-6 border-t-4 border-t-[var(--violet)] max-w-4xl mx-auto w-full">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <Award className="text-[var(--violet)]" size={20} />
            Créer un appel d'offre
          </h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={submitForm}>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Besoins concernés (Ctrl+Clic) *</label>
              <select
                multiple
                className="pro-input py-2 h-40"
                value={selectedBesoinIds}
                onChange={handleBesoinSelection}
                required
              >
                {besoinsDisponibles.map((item) => (
                  <option key={item.id} value={item.id} className="py-1 px-2 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-page)]">
                    {item.typeRessource} - {item.motif || "Sans motif"}
                  </option>
                ))}
              </select>
              <small className="block text-xs text-[var(--text-muted)] mt-2 font-medium">
                Seuls les besoins non assignés apparaissent.
              </small>
            </div>

            <div className="flex flex-col">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Date limite (Fin) *</label>
              <input
                type="date"
                className="pro-input"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                required
              />
              
              <div className="mt-auto pt-4 flex gap-2">
                <button type="submit" disabled={loading} className="pro-button flex-1 shadow-[var(--violet)]">
                  {loading ? "Création..." : "Générer l'appel"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="pro-button-secondary">
                  Annuler
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {!isFournisseur && (
        <div>
          <div className="pro-card p-0 overflow-hidden">
            <div className="pro-table-wrapper rounded-none border-0 shadow-none">
              <table>
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Date début</th>
                    <th>Date fin</th>
                    <th>Statut</th>
                    <th>Offres</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className={selectedId === item.id ? "bg-[var(--violet-light)]" : ""}>
                      <td><span className="font-mono text-[var(--text-secondary)] font-bold">{formatRef("AO", item.id)}</span></td>
                      <td>{item.dateDebut || "-"}</td>
                      <td>{item.dateFin || "-"}</td>
                      <td>{getStatusBadge(item.statut)}</td>
                      <td><span className="font-bold text-[var(--text-primary)]">{item.nombreOffres ?? 0}</span></td>
                      <td>
                        <div className="flex gap-2 flex-wrap">
                          <button className="pro-button-secondary py-1.5 px-3 text-xs" onClick={() => showDetails(item.id)}>
                            Détails
                          </button>
                          {canViewAffectationsPrevues && (
                            <button className="pro-button-secondary py-1.5 px-3 text-xs text-[var(--violet)] border-[var(--violet-light)] bg-[var(--violet-light)] hover:bg-indigo-100" onClick={() => showAffectationsPrevues(item.id)}>
                              Prévues
                            </button>
                          )}
                          {canCreateAndClose && item.statut !== "CLOS" && (
                            <>
                              <button className="pro-button-secondary py-1.5 px-3 text-xs text-green-600 border-green-200 bg-green-50 hover:bg-green-100" onClick={() => handleCloreEtSelectionner(item.id)}>
                                Moins disant
                              </button>
                              <button className="pro-button-secondary py-1.5 px-3 text-xs text-red-600 border-red-200 bg-red-50 hover:bg-red-100" onClick={() => handleClore(item.id)}>
                                Clore
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && items.length === 0 && (
                <div className="p-12 text-center text-[var(--text-secondary)] font-medium">Aucun appel d'offre trouvé.</div>
              )}
            </div>
          </div>

        {/* Details & Affectations Panel */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {details && (
            <div className="pro-card p-6 bg-[var(--bg-page)] border-[var(--border)]">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <FileText className="text-[var(--text-muted)]" size={20} />
                Détail de l'appel {formatRef("AO", details.id)}
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                <div className="text-[var(--text-secondary)] font-medium">Date début</div>
                <div className="font-bold text-[var(--text-primary)]">{details.dateDebut || "-"}</div>
                <div className="text-[var(--text-secondary)] font-medium">Date fin</div>
                <div className="font-bold text-[var(--text-primary)]">{details.dateFin || "-"}</div>
                <div className="text-[var(--text-secondary)] font-medium">Responsable</div>
                <div className="font-bold text-[var(--text-primary)]">{details.responsableNom || formatRef("USR", details.responsableId)}</div>
                <div className="text-[var(--text-secondary)] font-medium">Offres reçues</div>
                <div className="font-bold text-[var(--text-primary)]">{details.nombreOffres ?? 0}</div>
              </div>
            </div>
          )}

          {affectationsPrevues.length > 0 && (
            <div className="pro-card p-6 bg-[var(--violet-light)] border border-[var(--violet)] opacity-90">
              <h3 className="text-lg font-bold text-[var(--violet-dark)] mb-4 flex items-center gap-2">
                <CheckCircle className="text-[var(--violet)]" size={20} />
                Affectations Prévues
              </h3>
              <div className="space-y-3">
                {affectationsPrevues.map((item) => (
                  <div key={item.id} className="p-3 bg-white rounded-[var(--radius-md)] border border-[var(--border)] shadow-sm text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-[var(--text-primary)]">{item.typeRessource}</span>
                      <span className="text-xs bg-[var(--bg-page)] text-[var(--text-secondary)] px-2 py-0.5 rounded font-mono">Qté: {item.quantite}</span>
                    </div>
                    <div className="text-[var(--text-muted)] text-xs">
                      Pour: <span className="font-medium text-[var(--text-secondary)]">{item.departementNom || formatRef("DEP", item.departementId)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
