import { useEffect, useState } from "react";
import {
  bannirFournisseur,
  getFournisseurs,
  rehabiliterFournisseur,
  updateFournisseur,
} from "../services/fournisseurService";
import { registerFournisseur } from "../services/authService";
import { formatRef } from "../utils/idDisplay";
import { parseApiError } from "../utils/validation";
import { Users, Edit2, ShieldBan, CheckCircle, ShieldAlert, Plus, Mail, Lock } from "lucide-react";

export default function FournisseursPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeTab, setActiveTab] = useState("list"); // 'list' | 'create'
  
  // Forms states
  const [editForm, setEditForm] = useState({ id: "", adresse: "", siteWeb: "", gerant: "", nomSociete: "" });
  const [createForm, setCreateForm] = useState({ nomSociete: "", email: "", password: "" });
  
  // Ban states
  const [showBanModal, setShowBanModal] = useState(false);
  const [targetBanId, setTargetBanId] = useState("");
  const [motifBannissement, setMotifBannissement] = useState("");

  async function loadFournisseurs() {
    setLoading(true);
    try {
      const data = await getFournisseurs({});
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(parseApiError(err, "Impossible de charger les fournisseurs."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFournisseurs();
  }, []);

  function startEdit(item) {
    setEditForm({
      id: item.id,
      adresse: item.adresse || "",
      siteWeb: item.siteWeb || "",
      gerant: item.gerant || "",
      nomSociete: item.nomSociete || "",
    });
    setActiveTab("list");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      if (!editForm.id) throw new Error("Sélectionnez d'abord un fournisseur.");
      await updateFournisseur(editForm.id, { adresse: editForm.adresse, siteWeb: editForm.siteWeb, gerant: editForm.gerant });
      setSuccess("Fournisseur mis à jour avec succès.");
      await loadFournisseurs();
    } catch (err) {
      setError(parseApiError(err, "Mise à jour impossible."));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      await registerFournisseur({
        nomSociete: createForm.nomSociete,
        email: createForm.email,
        password: createForm.password
      });
      setSuccess("Compte fournisseur créé avec succès.");
      setCreateForm({ nomSociete: "", email: "", password: "" });
      setActiveTab("list");
      await loadFournisseurs();
    } catch (err) {
      setError(parseApiError(err, "Création impossible. Vérifiez l'email."));
    } finally {
      setLoading(false);
    }
  }

  async function handleBannir(id) {
    if (!motifBannissement.trim()) return setError("Renseignez un motif de bannissement.");
    setLoading(true); setError(""); setSuccess("");
    try {
      await bannirFournisseur(id, { motif: motifBannissement.trim() });
      setSuccess("Fournisseur banni avec succès.");
      setShowBanModal(false); setTargetBanId(""); setMotifBannissement("");
      await loadFournisseurs();
    } catch (err) {
      setError(parseApiError(err, "Bannissement impossible."));
    } finally {
      setLoading(false);
    }
  }

  async function handleRehabiliter(id) {
    if (!window.confirm("Voulez-vous vraiment réhabiliter ce fournisseur ?")) return;
    setLoading(true); setError(""); setSuccess("");
    try {
      await rehabiliterFournisseur(id);
      setSuccess("Fournisseur réhabilité.");
      await loadFournisseurs();
    } catch (err) {
      setError(parseApiError(err, "Réhabilitation impossible."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Gestion des Utilisateurs</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Répertoire et création des comptes fournisseurs.</p>
        </div>
        <div className="flex bg-[var(--bg-card)] rounded-[var(--radius-md)] p-1 border border-[var(--border)] shadow-sm">
          <button onClick={() => setActiveTab("list")} className={`px-4 py-1.5 rounded-[var(--radius-sm)] text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-[var(--violet-light)] text-[var(--violet)]' : 'text-[var(--text-secondary)]'}`}>
            Répertoire
          </button>
          <button onClick={() => setActiveTab("create")} className={`px-4 py-1.5 rounded-[var(--radius-sm)] text-sm font-bold transition-all ${activeTab === 'create' ? 'bg-[var(--violet-light)] text-[var(--violet)]' : 'text-[var(--text-secondary)]'}`}>
            + Nouveau
          </button>
        </div>
      </div>

      {(error || success) && (
        <div className={`p-4 rounded-[var(--radius-md)] text-sm font-bold flex items-center gap-2 ${error ? 'bg-[var(--red-bg)] text-[var(--red)] border border-red-200' : 'bg-[var(--green-bg)] text-[var(--green)] border border-green-200'}`}>
          {error ? <ShieldAlert size={18} /> : <CheckCircle size={18} />} {error || success}
        </div>
      )}

      {activeTab === "create" ? (
        <div className="pro-card p-8 max-w-2xl mx-auto border-t-4 border-t-[var(--violet)]">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Créer un compte Fournisseur</h2>
            <p className="text-[var(--text-secondary)] text-sm mt-1">Fournissez des accès de connexion à un nouveau partenaire.</p>
          </div>
          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Nom de la société *</label>
              <input type="text" className="pro-input" required value={createForm.nomSociete} onChange={e => setCreateForm(f => ({...f, nomSociete: e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Adresse Email (Login) *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail size={16} className="text-[var(--text-muted)]" /></div>
                <input type="email" className="pro-input pl-9" required value={createForm.email} onChange={e => setCreateForm(f => ({...f, email: e.target.value}))} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Mot de passe temporaire *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock size={16} className="text-[var(--text-muted)]" /></div>
                <input type="text" className="pro-input pl-9" required value={createForm.password} onChange={e => setCreateForm(f => ({...f, password: e.target.value}))} />
              </div>
            </div>
            <div className="pt-4">
              <button type="submit" disabled={loading} className="pro-button w-full shadow-[var(--violet)] shadow-sm">
                <Plus size={18} /> Enregistrer le fournisseur
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_2.5fr] gap-6">
          <div className="space-y-6">
            <div className="pro-card p-6 h-fit border-t-4 border-t-[var(--violet)]">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <Edit2 className="text-[var(--violet)]" size={20} />
                Édition Fournisseur
              </h3>
              <form className="space-y-4" onSubmit={handleUpdate}>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Cible</label>
                  <input className="pro-input bg-[var(--bg-page)] text-[var(--text-muted)]" value={editForm.id ? `${editForm.nomSociete} (${formatRef("FOU", editForm.id)})` : ""} readOnly placeholder="Sélectionnez dans la liste" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Gérant</label>
                  <input className="pro-input" value={editForm.gerant} onChange={(e) => setEditForm(f => ({...f, gerant: e.target.value}))} required disabled={!editForm.id} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Adresse</label>
                  <input className="pro-input" value={editForm.adresse} onChange={(e) => setEditForm(f => ({...f, adresse: e.target.value}))} required disabled={!editForm.id} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Site Web</label>
                  <input className="pro-input" value={editForm.siteWeb} onChange={(e) => setEditForm(f => ({...f, siteWeb: e.target.value}))} disabled={!editForm.id} />
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={loading || !editForm.id} className="pro-button w-full">Mettre à jour</button>
                </div>
              </form>
            </div>

            {showBanModal && (
              <div className="pro-card p-6 border-[var(--red)] bg-[var(--red-bg)]">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <ShieldBan className="text-[var(--red)]" size={20} />
                  Bannir Fournisseur
                </h3>
                <textarea className="pro-input mb-4" rows={3} value={motifBannissement} onChange={(e) => setMotifBannissement(e.target.value)} placeholder="Motif du bannissement..." />
                <div className="flex gap-2">
                  <button className="pro-button flex-1 bg-[var(--red)] hover:bg-red-700" onClick={() => handleBannir(targetBanId)}>Confirmer</button>
                  <button className="pro-button-secondary bg-white" onClick={() => { setShowBanModal(false); setMotifBannissement(""); }}>Annuler</button>
                </div>
              </div>
            )}
          </div>

          <div className="pro-card p-0 overflow-hidden">
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Users className="text-[var(--text-muted)]" size={20} /> Répertoire
              </h3>
            </div>
            <div className="pro-table-wrapper rounded-none border-0 shadow-none">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Société</th>
                    <th>Gérant</th>
                    <th>Statut / Motif</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className={editForm.id === item.id ? "bg-[var(--violet-light)]" : (item.estListeNoire ? "opacity-75 bg-[var(--red-bg)]" : "")}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full font-bold flex items-center justify-center text-xs ${item.estListeNoire ? 'bg-[var(--red)] text-white' : 'bg-[var(--violet-light)] text-[var(--violet)]'}`}>
                            {item.nomSociete ? item.nomSociete.charAt(0).toUpperCase() : "F"}
                          </div>
                          <div>
                            <span className="font-bold text-[var(--text-primary)]">{item.nomSociete || "-"}</span>
                            <div className="text-[10px] text-[var(--text-muted)] font-mono">{formatRef("FOU", item.id)}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="text-[var(--text-secondary)]">{item.gerant || "-"}</span></td>
                      <td>
                        {item.estListeNoire ? (
                          <div className="flex flex-col items-start gap-1">
                            <span className="status-badge status-badge-danger">Liste Noire</span>
                            <span className="text-[10px] text-[var(--red)] max-w-[150px] truncate" title={item.motifBannissement}>{item.motifBannissement}</span>
                          </div>
                        ) : (
                          <span className="status-badge status-badge-success">Actif</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <button className="text-xs font-bold text-[var(--violet)] hover:underline" onClick={() => startEdit(item)}>Éditer</button>
                          {item.estListeNoire ? (
                            <button className="text-xs font-bold text-[var(--green)] hover:underline" onClick={() => handleRehabiliter(item.id)}>Réhabiliter</button>
                          ) : (
                            <button className="text-xs font-bold text-[var(--red)] hover:underline" onClick={() => { setTargetBanId(item.id); setMotifBannissement(""); setShowBanModal(true); }}>Bannir</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && items.length === 0 && (
                <div className="p-12 text-center text-[var(--text-muted)] font-medium">Aucun fournisseur trouvé.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
