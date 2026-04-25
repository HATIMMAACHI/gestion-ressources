import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { cloturerReunion, createReunion, getReunions } from "../services/reunionService";
import { getDepartements } from "../services/departementService";
import { getBesoins } from "../services/besoinService";
import { formatRef } from "../utils/idDisplay";
import { parseApiError } from "../utils/validation";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, Users } from "lucide-react";

export default function ReunionsPage() {
  const { user } = useAuth();
  const canMutate = user?.role === "CHEF_DEPT" || user?.role === "RESPONSABLE";

  const [items, setItems] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [departementId, setDepartementId] = useState("");
  const [notes, setNotes] = useState("");
  const [draftBesoins, setDraftBesoins] = useState([]);
  const [selectedBesoinIds, setSelectedBesoinIds] = useState([]);
  const [loadingBesoins, setLoadingBesoins] = useState(false);

  // Simple calendar logic for current month
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayIndex = currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1; // Make Monday first day

  useEffect(() => {
    loadReunions();
    if (canMutate) loadDepartements();
  }, []);

  async function loadReunions() {
    setLoading(true);
    try {
      const data = await getReunions({});
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(parseApiError(err, "Impossible de charger les réunions."));
    } finally {
      setLoading(false);
    }
  }

  async function loadDepartements() {
    try {
      const data = await getDepartements();
      setDepartements(Array.isArray(data) ? data : []);
    } catch {
      setDepartements([]);
    }
  }

  async function loadDraftBesoins(nextDepartementId) {
    if (!nextDepartementId) {
      setDraftBesoins([]);
      setSelectedBesoinIds([]);
      return;
    }

    setLoadingBesoins(true);
    try {
      const data = await getBesoins({ departementId: nextDepartementId, statut: "BROUILLON" });
      setDraftBesoins(Array.isArray(data) ? data : []);
      setSelectedBesoinIds([]);
    } catch {
      setDraftBesoins([]);
      setSelectedBesoinIds([]);
    } finally {
      setLoadingBesoins(false);
    }
  }

  const handleDepartementChange = (value) => {
    setDepartementId(value);
    loadDraftBesoins(value);
  };

  const toggleBesoinSelection = (id) => {
    setSelectedBesoinIds((prev) =>
      prev.includes(id) ? prev.filter((it) => it !== id) : [...prev, id],
    );
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  // Helper to check if a day has events
  const getEventsForDay = (day) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    return items.filter(i => {
      if (!i.dateConvocation) return false;
      return i.dateConvocation.startsWith(targetDate);
    });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (selectedBesoinIds.length === 0) {
      setError("Sélectionnez au moins un besoin pour créer la réunion.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await createReunion({
        departementId: departementId.trim(),
        notes,
        besoinIds: selectedBesoinIds,
      });
      setSuccess("Événement créé avec succès.");
      setShowForm(false);
      setDepartementId("");
      setNotes("");
      setDraftBesoins([]);
      setSelectedBesoinIds([]);
      await loadReunions();
    } catch (err) {
      setError(parseApiError(err, "Création impossible."));
    } finally {
      setLoading(false);
    }
  };

  const handleCloturer = async (id) => {
    if (!window.confirm("Clôturer cet événement ?")) return;
    try {
      await cloturerReunion(id);
      await loadReunions();
    } catch (err) {
      setError(parseApiError(err, "Clôture impossible."));
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Planification</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Agenda mensuel des réunions et commissions.</p>
        </div>
        {canMutate && (
          <button onClick={() => setShowForm(!showForm)} className="pro-button shrink-0">
            <Plus size={18} /> Nouvel événement
          </button>
        )}
      </div>

      {(error || success) && (
        <div className={`p-4 rounded-[var(--radius-md)] text-sm font-bold ${error ? 'bg-[var(--red-bg)] text-[var(--red)]' : 'bg-[var(--green-bg)] text-[var(--green)]'}`}>
          {error || success}
        </div>
      )}

      {/* Main Grid: Calendar Left, Side Panel Right */}
      <div className="grid lg:grid-cols-[1fr_350px] gap-6 flex-1 items-start">
        
        {/* Monthly Calendar View */}
        <div className="pro-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-[var(--text-primary)]">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-page)] text-[var(--text-secondary)] transition-colors"><ChevronLeft size={18} /></button>
              <button onClick={nextMonth} className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-page)] text-[var(--text-secondary)] transition-colors"><ChevronRight size={18} /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-[var(--border)] border border-[var(--border)] rounded-[var(--radius-md)] overflow-hidden">
            {/* Days header */}
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div key={day} className="bg-[var(--bg-page)] py-3 text-center text-xs font-bold text-[var(--text-secondary)] uppercase">
                {day}
              </div>
            ))}
            
            {/* Empty days padding */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-white min-h-[100px] p-2 opacity-50"></div>
            ))}
            
            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
              const dayEvents = getEventsForDay(day);
              
              return (
                <div key={day} className={`bg-white min-h-[100px] p-2 flex flex-col gap-1 transition-colors hover:bg-[var(--bg-page)] cursor-pointer ${isToday ? 'ring-2 ring-inset ring-[var(--violet)]' : ''}`}>
                  <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-[var(--violet)] text-white' : 'text-[var(--text-primary)]'}`}>
                    {day}
                  </span>
                  
                  {/* Event Dots */}
                  <div className="flex flex-col gap-1 mt-1">
                    {dayEvents.slice(0, 3).map((ev, idx) => (
                      <div key={idx} className={`text-[10px] truncate px-1.5 py-0.5 rounded font-bold ${ev.statut === 'CLOTUREE' ? 'bg-[var(--green-bg)] text-[var(--green)]' : 'bg-[var(--violet-light)] text-[var(--violet)]'}`} title={ev.notes}>
                        {formatRef("DEP", ev.departementId)}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-[var(--text-muted)] font-bold px-1">+{dayEvents.length - 3}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel: Form or Upcoming Events */}
        <div className="flex flex-col gap-6">
          
          {showForm && canMutate && (
            <div className="pro-card p-6 border-t-4 border-t-[var(--violet)]">
              <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Plus size={18} className="text-[var(--violet)]" /> Nouvel événement
              </h3>
              <form onSubmit={submitForm} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Département</label>
                  <select className="pro-input" value={departementId} onChange={(e) => handleDepartementChange(e.target.value)} required>
                    <option value="">Sélectionner</option>
                    {departements.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Besoins en brouillon</label>
                  <div className="border border-[var(--border)] rounded-[var(--radius-md)] p-3 max-h-52 overflow-y-auto space-y-2 bg-white">
                    {loadingBesoins ? (
                      <p className="text-sm text-[var(--text-muted)]">Chargement des besoins...</p>
                    ) : !departementId ? (
                      <p className="text-sm text-[var(--text-muted)]">Sélectionnez d'abord un département.</p>
                    ) : draftBesoins.length === 0 ? (
                      <p className="text-sm text-[var(--text-muted)]">Aucun besoin en brouillon disponible.</p>
                    ) : (
                      draftBesoins.map((besoin) => (
                        <label key={besoin.id} className="flex items-start gap-2 text-sm text-[var(--text-primary)] cursor-pointer">
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={selectedBesoinIds.includes(besoin.id)}
                            onChange={() => toggleBesoinSelection(besoin.id)}
                          />
                          <span>
                            {besoin.description || formatRef("BES", besoin.id)}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">
                    {selectedBesoinIds.length} besoin(s) sélectionné(s)
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Ordre du jour</label>
                  <textarea className="pro-input min-h-[80px]" value={notes} onChange={(e) => setNotes(e.target.value)} required />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="pro-button flex-1" disabled={loading || selectedBesoinIds.length === 0}>Créer</button>
                  <button type="button" onClick={() => setShowForm(false)} className="pro-button-secondary">Annuler</button>
                </div>
              </form>
            </div>
          )}

          <div className="pro-card p-6 flex-1">
            <h3 className="font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <Clock size={18} className="text-[var(--text-secondary)]" /> Événements à venir
            </h3>
            
            <div className="space-y-4">
              {items.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] italic">Aucun événement planifié.</p>
              ) : (
                items.slice(0, 5).map(item => (
                  <div key={item.id} className="p-3 border border-[var(--border)] rounded-[var(--radius-md)] hover:border-[var(--violet)] transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold bg-[var(--bg-page)] px-2 py-1 rounded text-[var(--text-secondary)]">
                        {item.dateConvocation || "Bientôt"}
                      </span>
                      {item.statut === 'CLOTUREE' ? (
                        <span className="status-badge status-badge-success text-[10px]">Clôturé</span>
                      ) : (
                        <span className="status-badge status-badge-violet text-[10px]">Actif</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-primary)] line-clamp-2">{item.notes || "Réunion de département"}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-bold">
                        <Users size={14} /> {formatRef("DEP", item.departementId)}
                      </div>
                      {canMutate && item.statut !== 'CLOTUREE' && (
                        <button onClick={() => handleCloturer(item.id)} className="text-[10px] font-bold text-[var(--red)] hover:underline">
                          Clôturer
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
