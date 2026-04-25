import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { createRessource, getRessourceById, getRessources } from "../services/ressourceService";
import { getAffectations } from "../services/affectationService";
import { getOffres } from "../services/offreService";
import { getFournisseurs } from "../services/fournisseurService";
import { ROLES } from "../config/roles";
import { formatRef } from "../utils/idDisplay";
import { parseApiError } from "../utils/validation";
import { Package, Laptop, Printer, Search, Plus, Filter, LayoutGrid, List, ShieldAlert, CheckCircle, Award } from "lucide-react";

export default function RessourcesPage() {
  const { user } = useAuth();
  const canCreate = user?.role === ROLES.RESPONSABLE;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [acceptedOffres, setAcceptedOffres] = useState([]);
  const [loadingOffres, setLoadingOffres] = useState(false);
  const [selectedOffreId, setSelectedOffreId] = useState("");

  const [fournisseurs, setFournisseurs] = useState([]);
  const [loadingFournisseurs, setLoadingFournisseurs] = useState(false);

  const initialSpecs = useMemo(
    () => ({
      cpu: "",
      ram: "",
      disqueDur: "",
      ecran: "",
      vitesseImpression: "",
      resolution: "",
    }),
    [],
  );

  const initialForm = useMemo(
    () => ({
      offreId: "",
      type: "ORDINATEUR",
      marque: "",
      codeInventaire: "",
      dateLivraison: "",
      fournisseurAdresse: "",
      fournisseurGerant: "",
      specs: initialSpecs,
    }),
    [initialSpecs],
  );

  const [form, setForm] = useState(initialForm);
  const selectedOffre = useMemo(
    () => acceptedOffres.find((offre) => offre.id === selectedOffreId) || null,
    [acceptedOffres, selectedOffreId],
  );
  const selectedFournisseur = useMemo(() => {
    const fournisseurId = selectedOffre?.fournisseurId;
    if (!fournisseurId) return null;
    return fournisseurs.find((f) => f.id === fournisseurId) || null;
  }, [fournisseurs, selectedOffre?.fournisseurId]);
  
  // View toggle
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'

  // Filters
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const loadRessources = async () => {
    setLoading(true);
    try {
      let data = [];
      if (user?.role === ROLES.ENSEIGNANT) {
        // Enseignants: charger uniquement leurs affectations actives puis résoudre les ressources.
        // Le backend renvoie `ressourceId` (pas l'objet ressource).
        const affData = await getAffectations({ utilisateurId: user.id, actif: true });
        const ressourceIds = Array.isArray(affData)
          ? Array.from(new Set(affData.map((aff) => aff.ressourceId).filter(Boolean)))
          : [];

        const ressources = await Promise.all(
          ressourceIds.map(async (id) => {
            try {
              return await getRessourceById(id);
            } catch {
              return null;
            }
          }),
        );

        data = ressources.filter(Boolean);
      } else {
        // Autres rôles: charger toutes les ressources
        data = await getRessources();
      }
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  async function loadAcceptedOffres() {
    setLoadingOffres(true);
    try {
      const data = await getOffres({ statut: "ACCEPTEE" });
      setAcceptedOffres(Array.isArray(data) ? data : []);
    } catch {
      setAcceptedOffres([]);
    } finally {
      setLoadingOffres(false);
    }
  }

  async function loadFournisseurs() {
    setLoadingFournisseurs(true);
    try {
      const data = await getFournisseurs();
      setFournisseurs(Array.isArray(data) ? data : []);
    } catch {
      setFournisseurs([]);
    } finally {
      setLoadingFournisseurs(false);
    }
  }

  useEffect(() => {
    loadRessources();
  }, [user]);

  useEffect(() => {
    if (!showForm || !canCreate) return;
    loadAcceptedOffres();
    loadFournisseurs();
  }, [showForm, canCreate]);

  // Filter logic
  const filteredItems = items.filter(item => {
    if (search && !item.marque?.toLowerCase().includes(search.toLowerCase()) && !item.codeInventaire?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType && item.type !== filterType) return false;
    if (filterStatus && item.etat !== filterStatus) return false;
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "DISPONIBLE": return "bg-[var(--green)]";
      case "EN_PANNE": return "bg-[var(--red)]";
      case "AFFECTEE": return "bg-[var(--orange)]";
      default: return "bg-[var(--text-muted)]";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "DISPONIBLE": return "Disponible";
      case "EN_PANNE": return "En panne";
      case "AFFECTEE": return "Affectée";
      default: return status || "Inconnu";
    }
  };

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function setSpecsField(name, value) {
    setForm((prev) => ({ ...prev, specs: { ...prev.specs, [name]: value } }));
  }

  function buildSpecsJson(type, specs) {
    const payload = {};
    if (type === "ORDINATEUR") {
      if (specs.cpu.trim()) payload.cpu = specs.cpu.trim();
      if (specs.ram.trim()) payload.ram = specs.ram.trim();
      if (specs.disqueDur.trim()) payload.disqueDur = specs.disqueDur.trim();
      if (specs.ecran.trim()) payload.ecran = specs.ecran.trim();
    }
    if (type === "IMPRIMANTE") {
      if (specs.vitesseImpression.trim()) payload.vitesseImpression = specs.vitesseImpression.trim();
      if (specs.resolution.trim()) payload.resolution = specs.resolution.trim();
    }
    return JSON.stringify(payload);
  }

  function resetForm() {
    setForm(initialForm);
    setSelectedOffreId("");
    setShowForm(false);
  }

  function handleToggleForm() {
    if (!canCreate) return;
    setError("");
    setSuccess("");
    setShowForm((prev) => !prev);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSelectOffre(offreId) {
    setSelectedOffreId(offreId);
    const matched = acceptedOffres.find((item) => item.id === offreId) || null;
    setField("offreId", offreId);
    if (matched?.dateLivraison) {
      setField("dateLivraison", matched.dateLivraison);
    }
    const fournisseur = matched?.fournisseurId
      ? fournisseurs.find((f) => f.id === matched.fournisseurId) || null
      : null;
    setField("fournisseurAdresse", fournisseur?.adresse || "");
    setField("fournisseurGerant", fournisseur?.gerant || "");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!form.offreId) {
        setError("Veuillez sélectionner l'offre correspondante (statut ACCEPTÉE).");
        setLoading(false);
        return;
      }
      if (!form.codeInventaire.trim()) {
        setError("Le code d'inventaire est obligatoire.");
        setLoading(false);
        return;
      }

      const isOrdinateur = form.type === "ORDINATEUR";
      const hasValidSpecs = isOrdinateur
        ? form.specs.cpu.trim() && form.specs.ram.trim() && form.specs.disqueDur.trim() && form.specs.ecran.trim()
        : form.specs.vitesseImpression.trim() && form.specs.resolution.trim();

      if (!hasValidSpecs) {
        setError(
          isOrdinateur
            ? "Pour un ordinateur, renseignez CPU, RAM, disque dur et écran."
            : "Pour une imprimante, renseignez vitesse et résolution.",
        );
        setLoading(false);
        return;
      }

      const payload = {
        offreId: form.offreId,
        type: form.type,
        marque: form.marque.trim(),
        codeInventaire: form.codeInventaire.trim(),
        dateLivraison: form.dateLivraison,
        fournisseurAdresse: form.fournisseurAdresse?.trim() || "",
        fournisseurGerant: form.fournisseurGerant?.trim() || "",
        specsJson: buildSpecsJson(form.type, form.specs),
        ...(form.type === "ORDINATEUR"
          ? {
              cpu: form.specs.cpu.trim(),
              ram: form.specs.ram.trim(),
              disqueDur: form.specs.disqueDur.trim(),
              ecran: form.specs.ecran.trim(),
            }
          : {
              vitesseImpression: form.specs.vitesseImpression.trim(),
              resolution: form.specs.resolution.trim(),
            }),
      };

      await createRessource(payload);
      setSuccess("Ressource enregistrée et affectée automatiquement à l'enseignant.");
      resetForm();
      await loadRessources();
    } catch (err) {
      setError(parseApiError(err, "Création impossible."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 relative h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Gestion des Ressources</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Enregistrez les réceptions de matériel après acceptation d'une offre.
          </p>
        </div>
        {canCreate && (
          <button onClick={handleToggleForm} className="pro-button shrink-0">
            <Plus size={18} /> {showForm ? "Fermer" : "Réceptionner"}
          </button>
        )}
      </div>

      {(error || success) && (
        <div
          className={`p-4 rounded-[var(--radius-md)] text-sm font-bold flex items-center gap-2 ${
            error
              ? "bg-[var(--red-bg)] text-[var(--red)] border border-red-200"
              : "bg-[var(--green-bg)] text-[var(--green)] border border-green-200"
          }`}
        >
          {error ? <ShieldAlert size={18} /> : <CheckCircle size={18} />} {error || success}
        </div>
      )}

      {showForm && canCreate && (
        <div className="pro-card p-6 border-t-4 border-t-[var(--violet)] max-w-4xl mx-auto w-full">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <Award className="text-[var(--violet)]" size={20} />
            Réception après offre acceptée
          </h3>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Offre acceptée *
                </label>
                <select
                  className="pro-input"
                  value={selectedOffreId}
                  onChange={(e) => handleSelectOffre(e.target.value)}
                  required
                  disabled={loadingOffres || loadingFournisseurs}
                >
                  <option value="">{loadingOffres ? "Chargement..." : "Sélectionner une offre acceptée"}</option>
                  {acceptedOffres.map((offre) => (
                    <option key={offre.id} value={offre.id}>
                      {formatRef("OFF", offre.id)} - {formatRef("FOU", offre.fournisseurId)} - {offre.prixTotal ?? "-"} MAD
                    </option>
                  ))}
                </select>
                <small className="block text-xs text-[var(--text-muted)] mt-2 font-medium">
                  Seules les offres au statut <span className="font-bold">ACCEPTEE</span> sont listées.
                </small>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Fournisseur (déduit de l'offre)
                </label>
                <input
                  className="pro-input bg-[var(--bg-page)] text-[var(--text-muted)]"
                  value={selectedOffre?.fournisseurId ? formatRef("FOU", selectedOffre.fournisseurId) : "-"}
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Adresse du Fournisseur (temporaire)
                </label>
                <input
                  type="text"
                  className="pro-input"
                  value={form.fournisseurAdresse}
                  onChange={(e) => setField("fournisseurAdresse", e.target.value)}
                  placeholder={selectedFournisseur?.adresse ? "" : "Ex: Rabat, Maroc"}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Nom du Gérant (temporaire)
                </label>
                <input
                  type="text"
                  className="pro-input"
                  value={form.fournisseurGerant}
                  onChange={(e) => setField("fournisseurGerant", e.target.value)}
                  placeholder={selectedFournisseur?.gerant ? "" : "Ex: Nom du gérant"}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Type de ressource *
                </label>
                <select className="pro-input" value={form.type} onChange={(e) => setField("type", e.target.value)} required>
                  <option value="ORDINATEUR">ORDINATEUR</option>
                  <option value="IMPRIMANTE">IMPRIMANTE</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Date de livraison *
                </label>
                <input
                  type="date"
                  className="pro-input"
                  value={form.dateLivraison}
                  onChange={(e) => setField("dateLivraison", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Marque / Modèle *
                </label>
                <input
                  type="text"
                  className="pro-input"
                  value={form.marque}
                  onChange={(e) => setField("marque", e.target.value)}
                  placeholder="Ex: Dell, HP, Canon..."
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Code inventaire *
                </label>
                <input
                  type="text"
                  className="pro-input"
                  value={form.codeInventaire}
                  onChange={(e) => setField("codeInventaire", e.target.value)}
                  placeholder="Ex: INV-2026-001"
                  required
                />
              </div>
            </div>

            <div className="bg-[var(--bg-page)] p-4 rounded-[var(--radius-md)] border border-[var(--border)]">
              <p className="text-xs font-bold text-[var(--text-primary)] mb-3">Spécifications requises</p>
              {form.type === "ORDINATEUR" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    placeholder="CPU (ex: i7)"
                    className="pro-input h-10 text-sm"
                    value={form.specs.cpu}
                    onChange={(e) => setSpecsField("cpu", e.target.value)}
                    required
                  />
                  <input
                    placeholder="RAM (ex: 16GB)"
                    className="pro-input h-10 text-sm"
                    value={form.specs.ram}
                    onChange={(e) => setSpecsField("ram", e.target.value)}
                    required
                  />
                  <input
                    placeholder="Disque (ex: 512GB SSD)"
                    className="pro-input h-10 text-sm"
                    value={form.specs.disqueDur}
                    onChange={(e) => setSpecsField("disqueDur", e.target.value)}
                    required
                  />
                  <input
                    placeholder="Écran (ex: 27')"
                    className="pro-input h-10 text-sm"
                    value={form.specs.ecran}
                    onChange={(e) => setSpecsField("ecran", e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    placeholder="Vitesse (ex: 40ppm)"
                    className="pro-input h-10 text-sm"
                    value={form.specs.vitesseImpression}
                    onChange={(e) => setSpecsField("vitesseImpression", e.target.value)}
                    required
                  />
                  <input
                    placeholder="Résolution (ex: 1200dpi)"
                    className="pro-input h-10 text-sm"
                    value={form.specs.resolution}
                    onChange={(e) => setSpecsField("resolution", e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={loading} className="pro-button flex-1 shadow-[var(--violet)]">
                {loading ? "Enregistrement..." : "Enregistrer la ressource"}
              </button>
              <button type="button" className="pro-button-secondary" onClick={resetForm}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Top Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-[var(--text-muted)]" />
          </div>
          <input 
            type="text" 
            placeholder="Rechercher une ressource..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-[40px] rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-page)] pl-9 pr-4 text-sm outline-none focus:border-[var(--violet)] transition-colors"
          />
        </div>

        {/* Filters & View Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-2">
            <Filter size={16} className="text-[var(--text-secondary)]" />
            <select 
              className="h-[40px] rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm outline-none text-[var(--text-secondary)] font-semibold"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">Tous les types</option>
              <option value="ORDINATEUR">Ordinateur</option>
              <option value="IMPRIMANTE">Imprimante</option>
            </select>
            <select 
              className="h-[40px] rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm outline-none text-[var(--text-secondary)] font-semibold"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Tous statuts</option>
              <option value="DISPONIBLE">Disponible</option>
              <option value="AFFECTEE">Affectée</option>
              <option value="EN_PANNE">En panne</option>
            </select>
          </div>
          
          <div className="flex bg-[var(--bg-page)] rounded-[var(--radius-sm)] p-1 border border-[var(--border)]">
            <button 
              className={`p-1.5 rounded-[4px] transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-[var(--violet)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              className={`p-1.5 rounded-[4px] transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-[var(--violet)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-[var(--text-muted)]">Chargement des ressources...</div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
           <Package size={48} className="mb-4 opacity-50" />
           <p className="font-semibold">Aucune ressource trouvée.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View (3 Cols) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="pro-card p-6 flex flex-col hover:-translate-y-1 transition-transform duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 rounded-xl bg-[var(--violet-light)] text-[var(--violet)] flex items-center justify-center shrink-0">
                  {item.type === 'ORDINATEUR' ? <Laptop size={24} /> : item.type === 'IMPRIMANTE' ? <Printer size={24} /> : <Package size={24} />}
                </div>
                <div className="flex items-center gap-1.5 bg-[var(--bg-page)] px-2.5 py-1 rounded-full border border-[var(--border)]">
                   <div className={`w-2 h-2 rounded-full ${getStatusColor(item.etat)}`}></div>
                   <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{getStatusLabel(item.etat)}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1 truncate">{item.marque || "Marque inconnue"}</h3>
                <p className="text-[var(--text-secondary)] text-sm font-mono">{item.codeInventaire || formatRef("RES", item.id)}</p>
              </div>

              <div className="mt-auto pt-4 border-t border-[var(--border)] flex justify-between items-center">
                <span className="text-xs font-bold text-[var(--violet)] bg-[var(--violet-light)] px-2 py-1 rounded">
                  {item.type}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-medium">
                  Livré le: {item.dateLivraison || "-"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View (Table) */
        <div className="pro-table-wrapper">
          <table className="w-full">
            <thead>
              <tr>
                <th>Code Inventaire</th>
                <th>Type & Marque</th>
                <th>Statut</th>
                <th>Date livraison</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td><span className="font-mono font-bold text-[var(--text-primary)]">{item.codeInventaire || formatRef("RES", item.id)}</span></td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-[var(--violet-light)] text-[var(--violet)] flex items-center justify-center shrink-0">
                         {item.type === 'ORDINATEUR' ? <Laptop size={14} /> : item.type === 'IMPRIMANTE' ? <Printer size={14} /> : <Package size={14} />}
                      </div>
                      <div>
                        <div className="font-bold text-[var(--text-primary)]">{item.marque || "Marque inconnue"}</div>
                        <div className="text-[10px] uppercase font-bold text-[var(--text-muted)]">{item.type}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${getStatusColor(item.etat)}`}></div>
                       <span className="text-sm font-semibold text-[var(--text-secondary)]">{getStatusLabel(item.etat)}</span>
                    </div>
                  </td>
                  <td><span className="text-sm text-[var(--text-secondary)]">{item.dateLivraison || "-"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating Action Button */}
      {canCreate && (
        <button
          type="button"
          aria-label="Réceptionner une ressource"
          onClick={handleToggleForm}
          className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-[var(--violet)] text-white shadow-lg flex items-center justify-center hover:bg-[var(--violet-dark)] hover:scale-105 active:scale-95 transition-all z-50"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
