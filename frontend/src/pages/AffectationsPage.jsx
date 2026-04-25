import { useEffect, useMemo, useState } from "react";
import {
  createAffectation,
  deleteAffectation,
  getAffectations,
  updateAffectation,
} from "../services/affectationService";
import { getDepartements } from "../services/departementService";
import { getRessources } from "../services/ressourceService";
import { isOptionalUuid, parseApiError } from "../utils/validation";
import { formatIdCell, formatRef } from "../utils/idDisplay";
import { useAuth } from "../contexts/AuthContext";
import { ROLES } from "../config/roles";
import { Network, Plus, Edit2, Trash2, CheckCircle, ShieldAlert, Building2, Link2 } from "lucide-react";

const initialForm = {
  ressourceId: "",
  departementId: "",
  utilisateurId: "",
};

export default function AffectationsPage() {
  const { user } = useAuth();
  const canList = [ROLES.RESPONSABLE, ROLES.CHEF_DEPT].includes(user?.role);
  const canManage = [ROLES.RESPONSABLE, ROLES.CHEF_DEPT].includes(user?.role);

  const [items, setItems] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [ressourcesOptions, setRessourcesOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [departementIdFilter, setDepartementIdFilter] = useState("");
  const [typeAffectationFilter, setTypeAffectationFilter] = useState("");
  const [actifFilter, setActifFilter] = useState("");

  const [editingId, setEditingId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  async function loadAffectations(overrideFilters = {}) {
    setLoading(true);
    setError("");

    try {
      const departementValue = String(overrideFilters.departementId ?? departementIdFilter);
      const typeValue = String(overrideFilters.typeAffectation ?? typeAffectationFilter);
      const actifValue = String(overrideFilters.actif ?? actifFilter);

      if (departementValue && !isOptionalUuid(departementValue)) {
        setError("Identifiant département invalide.");
        setLoading(false);
        return;
      }

      const params = {};
      if (departementValue.trim()) params.departementId = departementValue.trim();
      if (typeValue) params.typeAffectation = typeValue;
      if (actifValue !== "") params.actif = actifValue === "true";

      const data = await getAffectations(params);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(parseApiError(err, "Impossible de charger les affectations."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAffectations();
    loadDepartements();
    loadRessourcesOptions();
  }, []);

  useEffect(() => {
    function handleTopbarFilters(event) {
      const nextDepartement = String(event.detail?.departementId || "");
      const nextType = String(event.detail?.typeAffectation || "");
      const nextActif = String(event.detail?.actif || "");

      setDepartementIdFilter(nextDepartement);
      setTypeAffectationFilter(nextType);
      setActifFilter(nextActif);
      loadAffectations({ departementId: nextDepartement, typeAffectation: nextType, actif: nextActif });
    }
    window.addEventListener("app:affectations-filters", handleTopbarFilters);
    return () => window.removeEventListener("app:affectations-filters", handleTopbarFilters);
  }, []);

  async function loadDepartements() {
    try {
      const data = await getDepartements();
      setDepartements(Array.isArray(data) ? data : []);
    } catch {
      setDepartements([]);
    }
  }

  async function loadRessourcesOptions() {
    try {
      const data = await getRessources();
      setRessourcesOptions(Array.isArray(data) ? data : []);
    } catch {
      setRessourcesOptions([]);
    }
  }

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setEditingId("");
    setForm(initialForm);
    setShowForm(false);
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      ressourceId: item.ressourceId || "",
      departementId: item.departementId || "",
      utilisateurId: item.utilisateurId || "",
    });
    setSuccess("");
    setError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submitForm(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!isOptionalUuid(form.ressourceId) || !form.ressourceId.trim()) {
        setError("Identifiant ressource invalide.");
        setLoading(false);
        return;
      }
      if (!isOptionalUuid(form.departementId) || !form.departementId.trim()) {
        setError("Identifiant département invalide.");
        setLoading(false);
        return;
      }
      if (form.utilisateurId && !isOptionalUuid(form.utilisateurId)) {
        setError("Identifiant utilisateur invalide.");
        setLoading(false);
        return;
      }

      const payload = {
        ressourceId: form.ressourceId.trim(),
        departementId: form.departementId.trim(),
      };

      if (form.utilisateurId.trim()) {
        payload.utilisateurId = form.utilisateurId.trim();
      }

      if (isEditing) {
        await updateAffectation(editingId, payload);
        setSuccess("Affectation modifiée avec succès.");
      } else {
        await createAffectation(payload);
        setSuccess("Affectation créée avec succès.");
      }

      resetForm();
      await loadAffectations();
    } catch (err) {
      setError(parseApiError(err, "Opération échouée."));
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(id) {
    if (!window.confirm("Confirmer la suppression de cette affectation ?")) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await deleteAffectation(id);
      setSuccess("Affectation supprimée avec succès.");
      if (editingId === id) resetForm();
      await loadAffectations();
    } catch (err) {
      setError(parseApiError(err, "Suppression impossible."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Affectations</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Gérez l'assignation du matériel aux départements et aux enseignants.
          </p>
        </div>
        {canManage && (
          <button 
            onClick={() => { setShowForm(!showForm); if (isEditing) resetForm(); }} 
            className="pro-button shrink-0 shadow-[var(--violet)] shadow-sm"
          >
            <Plus size={18} /> Nouvelle affectation
          </button>
        )}
      </div>

      {error && <div className="p-4 rounded-[var(--radius-md)] bg-[var(--red-bg)] border border-red-200 text-[var(--red)] text-sm font-bold flex items-center gap-2"><ShieldAlert size={18} /> {error}</div>}
      {success && <div className="p-4 rounded-[var(--radius-md)] bg-[var(--green-bg)] border border-green-200 text-[var(--green)] text-sm font-bold flex items-center gap-2"><CheckCircle size={18} /> {success}</div>}

      {/* Form Section */}
      {canManage && showForm && (
        <div className="pro-card p-6 border-t-4 border-t-[var(--violet)] max-w-4xl mx-auto">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <Link2 className="text-[var(--violet)]" size={20} />
            {isEditing ? "Modifier l'affectation" : "Nouvelle affectation"}
          </h3>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-6" onSubmit={submitForm}>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Ressource *</label>
              <select className="pro-input" value={form.ressourceId} onChange={(e) => setField("ressourceId", e.target.value)} required>
                <option value="">Choisir une ressource</option>
                {ressourcesOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {formatRef("RES", item.id)} - {item.type || "-"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Département *</label>
              <select className="pro-input" value={form.departementId} onChange={(e) => setField("departementId", e.target.value)} required>
                <option value="">Choisir un département</option>
                {departements.map((item) => (
                  <option key={item.id} value={item.id}>{item.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Utilisateur Assigné</label>
              <input className="pro-input" placeholder="Laisser vide si pour le département" value={form.utilisateurId} onChange={(e) => setField("utilisateurId", e.target.value)} />
            </div>

            <div className="md:col-span-3 flex gap-2 pt-2">
              <button type="submit" disabled={loading} className="pro-button">
                {isEditing ? <Edit2 size={16} /> : <Link2 size={16} />}
                {isEditing ? "Mettre à jour l'affectation" : "Créer l'affectation"}
              </button>
              <button type="button" onClick={resetForm} className="pro-button-secondary">Annuler</button>
            </div>
          </form>
        </div>
      )}

        {/* List Column */}
        {canList ? (
          <div className="pro-card p-0 overflow-hidden">
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
               <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                 <Network className="text-[var(--text-muted)]" size={20} />
                 Registre des assignations
               </h3>
               <span className="text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-page)] px-3 py-1.5 rounded-lg border border-[var(--border)]">{items.length} affectations</span>
            </div>
            
            <div className="pro-table-wrapper rounded-none border-0 shadow-none">
              <table>
                <thead>
                  <tr>
                    <th>Réf Affectation</th>
                    <th>Ressource</th>
                    <th>Département</th>
                    <th>Assigné à</th>
                    <th>Type</th>
                    <th>Statut</th>
                    {canManage && <th className="text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className={editingId === item.id ? "bg-[var(--violet-light)]" : ""}>
                      <td><span className="font-mono text-slate-500 font-bold">{formatRef("AFF", item.id)}</span></td>
                      <td><span className="font-mono font-medium text-slate-700">{formatRef("RES", item.ressourceId)}</span></td>
                      <td>
                         <span className="font-bold text-slate-700 flex items-center gap-1">
                            <Building2 size={12} className="text-slate-400" />
                            {formatRef("DEP", item.departementId)}
                         </span>
                      </td>
                      <td>
                         {item.affecteA || item.utilisateurId ? (
                           <span className="font-mono text-slate-600 text-xs px-2 py-1 bg-slate-100 rounded">{formatRef("USR", item.affecteA || item.utilisateurId)}</span>
                         ) : <span className="text-slate-400 italic text-xs">Aucun</span>}
                      </td>
                      <td>
                         <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded ${item.typeAffectation === 'INDIVIDUELLE' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                            {item.typeAffectation || "DÉPART."}
                         </span>
                      </td>
                      <td>
                         {item.actif ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-green-600"><div className="w-2 h-2 rounded-full bg-green-500"></div> Actif</span>
                         ) : (
                            <span className="flex items-center gap-1 text-xs font-bold text-slate-400"><div className="w-2 h-2 rounded-full bg-slate-300"></div> Inactif</span>
                         )}
                      </td>
                      {canManage && (
                        <td>
                          <div className="flex items-center justify-end gap-2">
                            <button className="pro-button-secondary p-2 text-slate-500 hover:text-[var(--violet)] hover:border-[var(--violet)] hover:bg-[var(--violet-light)]" onClick={() => startEdit(item)} title="Modifier">
                              <Edit2 size={14} />
                            </button>
                            <button className="pro-button-secondary p-2 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50" onClick={() => removeItem(item.id)} title="Supprimer">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && items.length === 0 && (
                <div className="p-12 text-center text-slate-500 font-medium border-t border-slate-100">Aucune affectation trouvée.</div>
              )}
            </div>
          </div>
        ) : (
          <div className="pro-card p-6 bg-[var(--bg-page)] border-[var(--border)] flex items-center justify-center text-center h-64">
            <div>
               <ShieldAlert className="mx-auto mb-3 text-[var(--text-muted)]" size={32} />
               <p className="text-[var(--text-secondary)] font-bold">Votre rôle ne vous permet pas de consulter le registre global des affectations.</p>
            </div>
          </div>
        )}
    </div>
  );
}
