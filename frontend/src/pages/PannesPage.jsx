import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getPannes, createPanne, prendreEnCharge, resolveDirectly, addConstat, addDecision } from "../services/panneService";
import { getRessourceById, getRessources } from "../services/ressourceService";
import { getAffectations } from "../services/affectationService";
import { ROLES } from "../config/roles";
import { formatRef } from "../utils/idDisplay";
import { AlertTriangle, Plus, Calendar, Package, Wrench, CheckCircle, FileText, Send, ChevronDown, ChevronUp, ClipboardList, Truck, ShieldCheck, ShieldAlert } from "lucide-react";

const STATUT_CONFIG = {
  OUVERTE:             { title: "À traiter",           color: "var(--red)",    bg: "var(--red-bg)" },
  EN_COURS:            { title: "En cours",            color: "var(--orange)", bg: "var(--orange-bg)" },
  EN_ATTENTE_DECISION: { title: "Attente décision",    color: "var(--violet)", bg: "var(--violet-light)" },
  ENVOYEE_FOURNISSEUR: { title: "Envoyée fournisseur", color: "#0891b2",      bg: "#ecfeff" },
  CONSTATEE:           { title: "Constatée",           color: "#7c3aed",      bg: "#f5f3ff" },
  RESOLUE:             { title: "Résolue",             color: "var(--green)",  bg: "var(--green-bg)" },
};

const FREQUENCE_OPTIONS = ["RARE", "FREQUENTE", "PERMANENTE"];
const TYPE_PANNE_OPTIONS = [
  { value: "MATERIEL", label: "Matériel" },
  { value: "LOGICIEL_SYSTEME", label: "Logiciel — Défaut système" },
  { value: "LOGICIEL_UTILITAIRE", label: "Logiciel — Logiciel utilitaire" },
];
const DECISION_OPTIONS = [
  { value: "RENVOYER_REPARER", label: "Renvoyer au fournisseur pour réparation" },
  { value: "RENVOYER_CHANGER", label: "Renvoyer au fournisseur pour remplacement" },
];

export default function PannesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [ressources, setRessources] = useState([]);
  const [affectations, setAffectations] = useState([]);
  const [ressourcesById, setRessourcesById] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [constatForm, setConstatForm] = useState({ explication: "", frequence: "RARE", typePanne: "MATERIEL" });
  const [decisionForm, setDecisionForm] = useState({ decision: "RENVOYER_REPARER" });
  const [showConstatForm, setShowConstatForm] = useState(null);
  const [showDecisionForm, setShowDecisionForm] = useState(null);
  const [form, setForm] = useState({ ressourceId: "", description: "", dateApparition: new Date().toISOString().split('T')[0] });

  async function loadData() {
    setLoading(true);
    try {
      const panData = await getPannes().catch(() => []);
      setItems(Array.isArray(panData) ? panData : []);
      if (user?.role === ROLES.ENSEIGNANT) {
        const affData = await getAffectations({ utilisateurId: user.id, actif: true }).catch(() => []);
        setAffectations(Array.isArray(affData) ? affData : []);
        setRessources([]);
        const ressourceIds = Array.isArray(affData) ? Array.from(new Set(affData.map(a => a.ressourceId).filter(Boolean))) : [];
        const pairs = await Promise.all(ressourceIds.map(async id => { try { return [id, await getRessourceById(id)]; } catch { return [id, null]; } }));
        const map = {};
        pairs.forEach(([id, r]) => { if (r) map[id] = r; });
        setRessourcesById(map);
      } else {
        const resData = await getRessources().catch(() => []);
        setRessources(Array.isArray(resData) ? resData : []);
        setAffectations([]);
        setRessourcesById({});
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.ressourceId) return alert("Sélectionnez une ressource.");
    setLoading(true);
    try {
      await createPanne({ ressourceId: form.ressourceId, description: form.description, dateApparition: form.dateApparition });
      setForm({ ressourceId: "", description: "", dateApparition: new Date().toISOString().split('T')[0] });
      setShowForm(false);
      await loadData();
    } catch { alert("Erreur lors de la déclaration."); }
    finally { setLoading(false); }
  }

  async function handleAction(actionFn, id, payload) {
    setActionLoading(id);
    try {
      if (payload) await actionFn(id, payload);
      else await actionFn(id);
      setShowConstatForm(null);
      setShowDecisionForm(null);
      await loadData();
    } catch (err) {
      alert(err?.response?.data?.message || "Erreur lors de l'action.");
    } finally { setActionLoading(null); }
  }

  async function handleConstatSubmit(e, panneId) {
    e.preventDefault();
    if (constatForm.explication.length < 30) return alert("L'explication doit contenir au moins 30 caractères.");
    await handleAction(addConstat, panneId, constatForm);
    setConstatForm({ explication: "", frequence: "RARE", typePanne: "MATERIEL" });
  }

  async function handleDecisionSubmit(e, panneId) {
    e.preventDefault();
    await handleAction(addDecision, panneId, decisionForm);
    setDecisionForm({ decision: "RENVOYER_REPARER" });
  }

  function getTypePanneOptions(panneItem) {
    const res = ressourcesById[panneItem?.ressourceId] || ressources.find(r => r.id === panneItem?.ressourceId);
    if (res?.type === "IMPRIMANTE") return TYPE_PANNE_OPTIONS.filter(o => o.value === "MATERIEL");
    return TYPE_PANNE_OPTIONS;
  }

  const canSignal = [ROLES.ENSEIGNANT, ROLES.CHEF_DEPT, ROLES.RESPONSABLE].includes(user?.role);
  const isTech = user?.role === ROLES.TECHNICIEN;
  const isResp = user?.role === ROLES.RESPONSABLE;
  const isFourn = user?.role === ROLES.FOURNISSEUR;

  // Filtrage pour le fournisseur : il voit ce qui lui est envoyé ET ce qu'il a déjà résolu
  const displayedItems = isFourn 
    ? items.filter(i => i.statut === "ENVOYEE_FOURNISSEUR" || i.statut === "RESOLUE")
    : items;

  const columns = isFourn ? [
    { id: "ENVOYEE_FOURNISSEUR", label: "À réparer / remplacer", bg: "rgba(245, 158, 11, 0.1)", border: "rgba(245, 158, 11, 0.2)", color: "#f59e0b" },
    { id: "RESOLUE", label: "Terminé / Rendu", bg: "rgba(16, 185, 129, 0.1)", border: "rgba(16, 185, 129, 0.2)", color: "#10b981" },
  ] : [
    { id: "OUVERTE", ...STATUT_CONFIG.OUVERTE },
    { id: "EN_COURS", ...STATUT_CONFIG.EN_COURS },
    { id: "EN_ATTENTE_DECISION", ...STATUT_CONFIG.EN_ATTENTE_DECISION },
    { id: "ENVOYEE_FOURNISSEUR", ...STATUT_CONFIG.ENVOYEE_FOURNISSEUR },
    { id: "RESOLUE", ...STATUT_CONFIG.RESOLUE },
  ];

  function renderCard(item, index) {
    const isExpanded = expandedId === item.id;
    const cfg = STATUT_CONFIG[item.statut] || STATUT_CONFIG.OUVERTE;
    return (
      <div
        key={item.id}
        className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[var(--violet)] transition-all duration-300 overflow-hidden"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">#{item.id.slice(0, 8)}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ color: cfg.color, backgroundColor: cfg.bg }}>{cfg.title}</span>
          </div>
          
          <h4 className="font-bold text-slate-800 text-[15px] mb-3 line-clamp-2 leading-tight group-hover:text-[var(--violet)] transition-colors">
            {item.description || "Panne non spécifiée."}
          </h4>

          <div className="flex items-center gap-2 flex-wrap mb-3">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
              <Package size={12} className="text-slate-400" /> 
              {item.ressourceCode || "RES-N/A"}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
              <Calendar size={12} className="text-slate-400" /> 
              {item.dateApparition || "—"}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
            <div className="flex gap-2">
              {item.estSousGarantie ? (
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <ShieldCheck size={10} /> GARANTIE OK
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  <ShieldAlert size={10} /> HORS GARANTIE
                </div>
              )}
            </div>
            {isExpanded ? <ChevronUp size={16} className="text-slate-300" /> : <ChevronDown size={16} className="text-slate-300" />}
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 border-t border-slate-50 pt-4 space-y-4 bg-slate-50/30">
            {/* Infos de base - Masquer le signalement pour le fournisseur */}
            <div className={`grid ${isFourn ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              {!isFourn && (
                <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Signalé par</p>
                  <p className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                      {item.signaledByNom?.charAt(0) || "U"}
                    </div>
                    {item.signaledByNom || "Utilisateur"}
                  </p>
                </div>
              )}
              <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Matériel</p>
                <p className="text-xs font-semibold text-slate-700 truncate">{item.marque || "Marque inconnue"}</p>
              </div>
            </div>

            {item.constat ? (
              <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-[var(--violet)] uppercase tracking-wider flex items-center gap-1.5"><FileText size={12} /> Constat du technicien</p>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.estSevere ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                    {item.estSevere ? 'SÉVÈRE' : 'MINEURE'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 italic">"{item.constat.explication}"</p>
                {item.constat.decisionResponsable && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Décision Responsable</p>
                    <p className="text-xs font-bold text-slate-700">{item.constat.decisionResponsable.replace(/_/g, " ")}</p>
                  </div>
                )}
              </div>
            ) : item.statut === "RESOLUE" ? (
              <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100 text-center">
                <p className="text-xs text-emerald-700 font-medium">Cette panne a été résolue directement sans constat technique majeur.</p>
              </div>
            ) : (
              <div className="bg-slate-100/50 rounded-xl p-3 border border-slate-200 border-dashed text-center">
                <p className="text-xs text-slate-400 font-medium italic">En attente de prise en charge par un technicien.</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {isFourn && item.statut === "ENVOYEE_FOURNISSEUR" && (
                <button 
                  disabled={actionLoading === item.id} 
                  onClick={() => handleAction(resolveDirectly, item.id)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-600 transition-all shadow-sm shadow-emerald-100"
                >
                  <CheckCircle size={14} /> MARQUER COMME RÉPARÉ / RENDU
                </button>
              )}
              {isTech && item.statut === "OUVERTE" && (
                <button disabled={actionLoading === item.id} onClick={() => handleAction(prendreEnCharge, item.id)}
                  className="pro-button text-xs !py-2.5 !px-4"><Wrench size={14} /> Prendre en charge</button>
              )}
              {isTech && item.statut === "EN_COURS" && (
                <>
                  <button disabled={actionLoading === item.id} onClick={() => handleAction(resolveDirectly, item.id)}
                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-600 transition-all">
                    <CheckCircle size={14} /> Résoudre (mineure)</button>
                  <button onClick={() => { setShowConstatForm(showConstatForm === item.id ? null : item.id); setShowDecisionForm(null); }}
                    className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-600 transition-all">
                    <ClipboardList size={14} /> Constat (sévère)</button>
                </>
              )}
              {isResp && item.statut === "EN_ATTENTE_DECISION" && item.constat && !item.constat.decisionResponsable && (
                <button onClick={() => { setShowDecisionForm(showDecisionForm === item.id ? null : item.id); setShowConstatForm(null); }}
                  className="pro-button text-xs !py-2.5 !px-4"><Send size={14} /> Prendre une décision</button>
              )}
            </div>

            {showConstatForm === item.id && (
              <form onSubmit={e => handleConstatSubmit(e, item.id)} className="bg-[var(--red-bg)] rounded-[var(--radius-sm)] p-3 border border-[var(--red)] space-y-2 mt-2">
                <p className="text-xs font-bold text-[var(--red)]">Rédaction du constat</p>
                <textarea className="pro-input !h-auto !min-h-[80px] text-xs" placeholder="Explication détaillée de la panne (min 30 caractères)..." required minLength={30}
                  value={constatForm.explication} onChange={e => setConstatForm({ ...constatForm, explication: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Fréquence</label>
                    <select className="pro-input !h-9 text-xs" value={constatForm.frequence} onChange={e => setConstatForm({ ...constatForm, frequence: e.target.value })}>
                      {FREQUENCE_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Type de panne</label>
                    <select className="pro-input !h-9 text-xs" value={constatForm.typePanne} onChange={e => setConstatForm({ ...constatForm, typePanne: e.target.value })}>
                      {getTypePanneOptions(item).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={actionLoading === item.id} className="pro-button text-xs !py-1.5">Envoyer le constat</button>
                  <button type="button" className="pro-button-secondary text-xs !py-1.5" onClick={() => setShowConstatForm(null)}>Annuler</button>
                </div>
              </form>
            )}

            {showDecisionForm === item.id && (
              <form onSubmit={e => handleDecisionSubmit(e, item.id)} className="bg-[var(--violet-light)] rounded-[var(--radius-sm)] p-3 border border-[var(--violet)] space-y-2 mt-2">
                <p className="text-xs font-bold text-[var(--violet)]">Décision du responsable</p>
                <select className="pro-input !h-9 text-xs" value={decisionForm.decision} onChange={e => setDecisionForm({ decision: e.target.value })}>
                  {DECISION_OPTIONS.map(o => (
                    <option 
                      key={o.value} 
                      value={o.value} 
                      disabled={o.value === 'RENVOYER_CHANGER' && !item.estSousGarantie}
                    >
                      {o.label} {o.value === 'RENVOYER_CHANGER' && !item.estSousGarantie ? "(Désactivé: Garantie expirée)" : ""}
                    </option>
                  ))}
                </select>
                {!item.estSousGarantie && (
                  <p className="text-[10px] text-[var(--red)] font-bold">⚠ La garantie est expirée. Le remplacement est impossible.</p>
                )}
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={actionLoading === item.id} className="pro-button text-xs !py-1.5"><Truck size={13} /> Confirmer</button>
                  <button type="button" className="pro-button-secondary text-xs !py-1.5" onClick={() => setShowDecisionForm(null)}>Annuler</button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Maintenance & Pannes</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Workflow complet : signalement → intervention → constat → décision → fournisseur.</p>
        </div>
        {canSignal && (
          <button onClick={() => setShowForm(!showForm)} className="pro-button shrink-0 shadow-[var(--violet)] shadow-sm">
            <Plus size={18} /> Signaler une panne
          </button>
        )}
      </div>

      {showForm && (
        <div className="pro-card p-6 border-t-4 border-t-[var(--violet)]">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <AlertTriangle className="text-[var(--violet)]" size={20} /> Déclaration de panne matérielle
          </h3>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Ressource *</label>
              <select className="pro-input" required value={form.ressourceId} onChange={e => setForm({ ...form, ressourceId: e.target.value })}>
                <option value="">Sélectionner une machine</option>
                {user?.role === ROLES.ENSEIGNANT
                  ? affectations.map(aff => (
                    <option key={aff.id} value={aff.ressourceId}>
                      {ressourcesById[aff.ressourceId]?.type || "-"} {ressourcesById[aff.ressourceId]?.marque || "-"} - {ressourcesById[aff.ressourceId]?.codeInventaire || formatRef("RES", aff.ressourceId)}
                    </option>
                  ))
                  : ressources.map(res => (
                    <option key={res.id} value={res.id}>{res.type} {res.marque} - {res.codeInventaire || formatRef("RES", res.id)}</option>
                  ))
                }
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Date d'apparition *</label>
              <input type="date" className="pro-input" required value={form.dateApparition} onChange={e => setForm({ ...form, dateApparition: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Description du problème *</label>
              <input type="text" className="pro-input" placeholder="L'écran ne s'allume plus..." required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="md:col-span-3 flex gap-2 pt-2">
              <button type="submit" disabled={loading} className="pro-button"><Wrench size={16} /> Envoyer au support technique</button>
              <button type="button" className="pro-button-secondary" onClick={() => setShowForm(false)}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex justify-center items-center py-20 text-[var(--text-muted)] font-bold">Chargement du Kanban...</div>
      ) : (
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4 min-h-[500px] scrollbar-thin">
          {columns.map(col => {
            const colItems = displayedItems.filter(i => (i.statut || "OUVERTE") === col.id);
            return (
              <div key={col.id} className="flex flex-col h-full bg-[var(--bg-page)] rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden min-w-[280px] max-w-[320px] shrink-0">
                <div className="p-3 border-b border-[var(--border)] flex items-center justify-between" style={{ backgroundColor: col.bg }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }}></div>
                    <h3 className="font-bold text-[var(--text-primary)] text-xs">{col.title}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[var(--text-secondary)] shadow-sm">{colItems.length}</span>
                </div>
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {colItems.length === 0 ? (
                    <div className="p-3 text-center text-xs font-bold text-[var(--text-muted)] border-2 border-dashed border-[var(--border)] rounded-[var(--radius-md)] opacity-50">Aucune</div>
                  ) : colItems.map((item, idx) => renderCard(item, idx))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
