import { useEffect, useMemo, useState } from "react";
import {
  createBesoin,
  deleteBesoin,
  getBesoins,
  updateBesoin,
  updateBesoinStatus,
} from "../services/besoinService";
import { formatRef } from "../utils/idDisplay";
import { isOptionalUuid, parseApiError } from "../utils/validation";
import { useAuth } from "../contexts/AuthContext";
import { ROLES } from "../config/roles";
import { ClipboardList, Plus, FileText, CheckCircle, ShieldAlert, Monitor, Printer, Send } from "lucide-react";

const typeOptions = ["ORDINATEUR", "IMPRIMANTE"];

const initialForm = { typeRessource: "ORDINATEUR", quantite: 1, motif: "" };
// Les specs sont maintenant gérées comme une liste d'objets { label, value }
const initialSpecs = [];

const PRESETS = {
  ORDINATEUR: ["CPU", "RAM", "DISQUE DUR", "ÉCRAN", "CARTE GRAPHIQUE"],
  IMPRIMANTE: ["VITESSE D'IMPRESSION", "RÉSOLUTION", "TYPE DE PAPIER", "RECTO-VERSO"]
};

function parseSpecsToFields(specsValue) {
  if (!specsValue) return [];
  try {
    const parsed = JSON.parse(specsValue);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return [];
    return Object.entries(parsed).map(([k, v]) => ({ 
      label: k.replace(/([A-Z])/g, ' $1').trim().toUpperCase(), 
      value: v 
    }));
  } catch { return []; }
}

function buildSpecsJson(specsArray) {
  const payload = {};
  specsArray.forEach(spec => {
    if (spec.label.trim() && spec.value.trim()) {
      // Nettoyage de la clé pour le JSON (minuscule, sans espaces)
      const key = spec.label.trim().toLowerCase().replace(/\s+/g, '');
      payload[key] = spec.value.trim();
    }
  });
  return JSON.stringify(payload);
}

function renderSpecsSummary(item) {
  if (!item) return "-";
  const specsJson = item.specsJson || item.specs;
  if (!specsJson) return "-";
  try {
    const specs = JSON.parse(specsJson);
    return Object.entries(specs).map(([key, val]) => `${key.toUpperCase()}: ${val}`).join(" | ");
  } catch { return "-"; }
}

export default function BesoinsPage() {
  const { user } = useAuth();
  const canList = user?.role === ROLES.CHEF_DEPT || user?.role === ROLES.RESPONSABLE || user?.role === ROLES.ENSEIGNANT;
  const canCreate = user?.role === ROLES.CHEF_DEPT || user?.role === ROLES.ENSEIGNANT;
  const canEditDelete = user?.role === ROLES.CHEF_DEPT || user?.role === ROLES.ENSEIGNANT;
  const canValider = user?.role === ROLES.CHEF_DEPT;
  const canEnvoyerEnAppel = user?.role === ROLES.RESPONSABLE;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [departementId, setDepartementId] = useState("");
  const [statut, setStatut] = useState("");

  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(initialForm);
  const [specs, setSpecs] = useState(initialSpecs);

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);
  const totalItems = items.length;
  const brouillons = items.filter((item) => item.statut === "BROUILLON").length;
  const valides = items.filter((item) => item.statut === "VALIDE").length;

  async function loadBesoins(overrideFilters = {}) {
    setLoading(true); setError("");
    try {
      const params = {};
      const departementIdValue = (overrideFilters.departementId ?? departementId).trim();
      const statutValue = overrideFilters.statut ?? statut;
      if (departementIdValue) params.departementId = departementIdValue;
      if (statutValue) params.statut = statutValue;

      const data = await getBesoins(params);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(parseApiError(err, "Impossible de charger les besoins."));
    } finally { setLoading(false); }
  }

  useEffect(() => { if (canList) loadBesoins(); }, []);

  function setField(name, value) { setForm((prev) => ({ ...prev, [name]: value })); }

  function resetForm() {
    setForm(initialForm); setSpecs(initialSpecs); setEditingId(""); setShowForm(false);
  }

  function startEdit(item) {
    if (item?.statut !== "BROUILLON") return setError("Seuls les besoins en BROUILLON peuvent être modifiés.");
    setEditingId(item.id);
    setForm({ typeRessource: item.typeRessource || "ORDINATEUR", quantite: item.quantite || 1, motif: item.motif || "" });
    setSpecs(parseSpecsToFields(item.specs || item.specsJson || "{}"));
    setSuccess(""); setError(""); setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submitForm(event) {
    event.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      const validSpecs = specs.some(s => s.label.trim() && s.value.trim());

      if (!validSpecs) {
        setError("Veuillez renseigner au moins une spécification technique.");
        setLoading(false); return;
      }

      const payload = { 
        typeRessource: form.typeRessource, 
        quantite: Number(form.quantite), 
        specs: buildSpecsJson(specs), 
        motif: form.motif 
      };
      if (isEditing) { await updateBesoin(editingId, payload); setSuccess("Besoin modifié."); } 
      else { await createBesoin(payload); setSuccess("Demande de besoin créée."); }

      resetForm(); 
      if (canList) await loadBesoins();
    } catch (err) { setError(parseApiError(err, "Opération échouée.")); } 
    finally { setLoading(false); }
  }

  async function handleValiderBesoin(item) {
    setLoading(true); setError(""); setSuccess("");
    try {
      await updateBesoinStatus(item.id, "VALIDE", item.statut);
      setSuccess("Besoin validé !");
      await loadBesoins();
    } catch (err) { setError(parseApiError(err, "Validation impossible.")); } 
    finally { setLoading(false); }
  }

  async function handleEnvoyerEnAppel(item) {
    setLoading(true); setError(""); setSuccess("");
    try {
      await updateBesoinStatus(item.id, "EN_APPEL", item.statut);
      setSuccess("Besoin envoyé en appel d'offre.");
      await loadBesoins();
    } catch (err) { setError(parseApiError(err, "Envoi en appel impossible.")); } 
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Gestion des Besoins</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Centralisez et validez les demandes de matériel.</p>
        </div>
        <div className="flex items-center gap-4">
           {/* Mini stats inline for a cleaner NexaDesk look */}
           <div className="hidden md:flex gap-4 mr-4 border-r border-[var(--border)] pr-4">
             <div className="text-center">
               <div className="text-lg font-black text-[var(--violet)]">{brouillons}</div>
               <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Brouillons</div>
             </div>
             <div className="text-center">
               <div className="text-lg font-black text-[var(--green)]">{valides}</div>
               <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Validés</div>
             </div>
           </div>
           
           {canCreate && (
             <button onClick={() => { setShowForm(!showForm); if(isEditing) resetForm(); }} className="pro-button shrink-0">
               <Plus size={18} /> Nouvelle demande
             </button>
           )}
        </div>
      </div>

      {(error || success) && (
        <div className={`p-4 rounded-[var(--radius-md)] text-sm font-bold flex items-center gap-2 ${error ? 'bg-[var(--red-bg)] text-[var(--red)] border border-red-200' : 'bg-[var(--green-bg)] text-[var(--green)] border border-green-200'}`}>
          {error ? <ShieldAlert size={18} /> : <CheckCircle size={18} />} {error || success}
        </div>
      )}

      {showForm && canCreate && (
        <div className="pro-card p-6 border-t-4 border-t-[var(--violet)] max-w-3xl mx-auto">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <ClipboardList className="text-[var(--violet)]" size={20} />
            {isEditing ? "Modifier la demande" : "Nouvelle Demande"}
          </h3>
          <form className="space-y-5" onSubmit={submitForm}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Type de ressource</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     {form.typeRessource === "ORDINATEUR" ? <Monitor size={16} className="text-[var(--text-muted)]"/> : <Printer size={16} className="text-[var(--text-muted)]"/>}
                   </div>
                   <select className="pro-input pl-9" value={form.typeRessource} onChange={(e) => setField("typeRessource", e.target.value)}>
                     {typeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                   </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Quantité demandée</label>
                <input type="number" min="1" className="pro-input" value={form.quantite} onChange={(e) => setField("quantite", e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Motif de la demande</label>
              <input type="text" placeholder="Ex: Renouvellement, Nouvel employé..." className="pro-input" value={form.motif} onChange={(e) => setField("motif", e.target.value)} required />
            </div>

            <div className="bg-[var(--bg-page)] p-4 rounded-[var(--radius-md)] border border-[var(--border)]">
               <div className="flex items-center justify-between mb-4">
                 <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Détails techniques requis</p>
                 <button type="button" onClick={() => setSpecs([...specs, { label: "", value: "" }])}
                   className="text-[10px] font-bold text-[var(--violet)] hover:underline flex items-center gap-1">
                   <Plus size={12}/> Ajouter autre
                 </button>
               </div>

               {/* Presets based on type */}
               <div className="flex flex-wrap gap-2 mb-4">
                 {PRESETS[form.typeRessource].map(p => (
                   <button key={p} type="button" onClick={() => { if(!specs.find(s => s.label === p)) setSpecs([...specs, { label: p, value: "" }]) }}
                     className="text-[10px] font-bold bg-white border border-slate-200 px-2.5 py-1 rounded-full hover:border-[var(--violet)] hover:text-[var(--violet)] transition-all">
                     + {p}
                   </button>
                 ))}
               </div>

               <div className="space-y-3">
                 {specs.map((s, idx) => (
                   <div key={idx} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                     <input placeholder="Libellé (ex: RAM)" className="pro-input h-9 text-xs flex-1" value={s.label}
                       onChange={(e) => {
                         const newSpecs = [...specs];
                         newSpecs[idx].label = e.target.value.toUpperCase();
                         setSpecs(newSpecs);
                       }} required />
                     <input placeholder="Valeur (ex: 16Go)" className="pro-input h-9 text-xs flex-1" value={s.value}
                       onChange={(e) => {
                         const newSpecs = [...specs];
                         newSpecs[idx].value = e.target.value;
                         setSpecs(newSpecs);
                       }} required />
                     <button type="button" onClick={() => setSpecs(specs.filter((_, i) => i !== idx))}
                       className="p-2 text-slate-400 hover:text-[var(--red)] transition-colors">
                       <Plus size={16} className="rotate-45" />
                     </button>
                   </div>
                 ))}
                 {specs.length === 0 && (
                    <div className="text-center py-4 border-2 border-dashed border-slate-200 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Utilisez les boutons ci-dessus pour ajouter des spécifications</p>
                    </div>
                 )}
               </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={loading} className="pro-button flex-1 shadow-[var(--violet)]">
                {isEditing ? "Mettre à jour la demande" : "Soumettre la demande"}
              </button>
              <button type="button" className="pro-button-secondary" onClick={resetForm}>Fermer</button>
            </div>
          </form>
        </div>
      )}

      <div className="pro-card p-0 overflow-hidden">
        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
             <FileText className="text-[var(--text-muted)]" size={20} /> Registre des besoins
          </h3>
        </div>
        
        <div className="pro-table-wrapper rounded-none border-0 shadow-none">
          <table className="w-full">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Type & Motif</th>
                <th>Détails techniques</th>
                <th>Quantité</th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td><span className="font-mono font-bold text-[var(--text-muted)]">{formatRef("BES", item.id)}</span></td>
                  <td>
                    <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded-lg bg-[var(--bg-page)] text-[var(--violet)] flex items-center justify-center shrink-0">
                          {item.typeRessource === "ORDINATEUR" ? <Monitor size={14}/> : <Printer size={14}/>}
                       </div>
                       <div>
                         <div className="font-bold text-[var(--text-primary)]">{item.motif || "Demande classique"}</div>
                         <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider">{item.typeRessource}</div>
                       </div>
                    </div>
                  </td>
                  <td><p className="text-xs text-[var(--text-secondary)] truncate max-w-[200px]" title={renderSpecsSummary(item)}>{renderSpecsSummary(item)}</p></td>
                  <td><span className="font-bold text-[var(--text-primary)] px-2 py-1 bg-[var(--bg-page)] rounded">{item.quantite}</span></td>
                  <td>
                    <span className={`status-badge ${
                      item.statut === 'VALIDE' ? 'status-badge-success' : 
                      item.statut === 'EN_APPEL' ? 'status-badge-violet' : 
                      'status-badge-warning'
                    }`}>
                      {item.statut}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      {canEditDelete && item.statut === "BROUILLON" && (
                        <button className="text-xs font-bold text-[var(--violet)] hover:underline" onClick={() => startEdit(item)}>Éditer</button>
                      )}
                      {canValider && (item.statut === "BROUILLON" || item.statut === "EN_REUNION") && (
                        <button className="pro-button py-1 px-3 text-[10px]" onClick={() => handleValiderBesoin(item)}>
                           <CheckCircle size={12}/> Valider
                        </button>
                      )}
                      {canEnvoyerEnAppel && item.statut === "VALIDE" && (
                        <button className="pro-button py-1 px-3 text-[10px]" onClick={() => handleEnvoyerEnAppel(item)}>
                           <Send size={12}/> Créer Appel
                        </button>
                      )}
                      {!(canEditDelete && item.statut === "BROUILLON") && 
                       !(canValider && (item.statut === "BROUILLON" || item.statut === "EN_REUNION")) && 
                       !(canEnvoyerEnAppel && item.statut === "VALIDE") && (
                        <span className="text-[10px] font-bold text-[var(--text-muted)] italic">
                          {item.statut === "BROUILLON" ? "Attente Chef Dept." : item.statut === "EN_APPEL" ? "Déjà traité" : "-"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && items.length === 0 && (
            <div className="p-12 text-center text-[var(--text-muted)] font-medium">Aucun besoin pour le moment.</div>
          )}
        </div>
      </div>
    </div>
  );
}
