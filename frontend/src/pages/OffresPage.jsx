import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import NotificationToast from '../components/NotificationToast'
import {
  createOffre,
  getOffreById,
  getMyOffres,
  getOffresByAppelOffre,
  selectionnerOffre,
} from '../services/offreService'
import { getAffectationsPrevues, getAppelsOffre } from '../services/appelOffreService'
import { isOptionalUuid, parseApiError } from '../utils/validation'
import { useAuth } from '../contexts/AuthContext'
import { ROLES } from '../config/roles'
import { Handshake, FileText, CheckCircle, Search, ShieldAlert, ArrowRight, Package } from 'lucide-react'

function toText(value) {
  if (value === null || value === undefined || value === '') return '-'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function formatRef(prefix, id) {
  if (!id) return '-'
  const raw = String(id)
  const shortPart = raw.split('-')[0]?.toUpperCase() || raw.slice(0, 8).toUpperCase()
  return `${prefix}-${shortPart}`
}

function getStatusBadge(statut) {
  if (statut === 'ACCEPTEE') return <span className="status-badge status-badge-success">{statut}</span>
  if (statut === 'REJETEE') return <span className="status-badge status-badge-danger">{statut}</span>
  return <span className="status-badge status-badge-warning">{statut || 'EN ATTENTE'}</span>
}

function parseDetails(detailJson) {
  if (!detailJson) return []
  try {
    const parsed = JSON.parse(detailJson)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function OffresPage() {
  const location = useLocation()
  const { user } = useAuth()
  const canCreate = user?.role === ROLES.FOURNISSEUR
  const canSelect = user?.role === ROLES.RESPONSABLE
  const isFournisseur = user?.role === ROLES.FOURNISSEUR

  const [items, setItems] = useState([])
  const [appelsOffreOptions, setAppelsOffreOptions] = useState([])
  const [selectedAppel, setSelectedAppel] = useState(null)
  const [detailLines, setDetailLines] = useState([])
  const [detailOffre, setDetailOffre] = useState(null)
  const [myOffers, setMyOffers] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [appelOffreIdFilter, setAppelOffreIdFilter] = useState('')

  const [dateLivraison, setDateLivraison] = useState('')
  const [dureeGarantieMois, setDureeGarantieMois] = useState(24)
  const prixTotal = useMemo(
    () => detailLines.reduce((total, line) => total + (Number(line.prixUnitaire) || 0) * (Number(line.quantite) || 1), 0),
    [detailLines],
  )

  const appelsOuverts = useMemo(
    () => (Array.isArray(appelsOffreOptions) ? appelsOffreOptions.filter((item) => item.statut === 'OUVERT') : []),
    [appelsOffreOptions],
  )

  const notificationKey = useMemo(
    () => `supplier-offer-statuses:${user?.id || user?.email || 'anonymous'}`,
    [user?.id, user?.email],
  )

  function getStoredStatuses() {
    try {
      return JSON.parse(localStorage.getItem(notificationKey) || '{}') || {}
    } catch {
      return {}
    }
  }

  function storeStatuses(snapshot) {
    localStorage.setItem(notificationKey, JSON.stringify(snapshot))
  }

  function pushNotification(notification) {
    setNotifications((prev) => [...prev, notification])
  }

  function dismissNotification(notificationId) {
    setNotifications((prev) => prev.filter((item) => item.id !== notificationId))
  }

  useEffect(() => {
    loadAppelsOffreOptions()
    if (isFournisseur) {
      loadMyOffers()
    }
  }, [])

  useEffect(() => {
    const selectedId = location.state?.appelOffreId
    if (!selectedId || !appelsOuverts.length) return

    const matched = appelsOuverts.find((item) => item.id === selectedId)
    if (matched) {
      startWorkflow(matched)
    }
  }, [location.state?.appelOffreId, appelsOuverts])

  async function loadAppelsOffreOptions() {
    try {
      const data = await getAppelsOffre()
      setAppelsOffreOptions(Array.isArray(data) ? data : [])
    } catch {
      setAppelsOffreOptions([])
    }
  }

  async function loadMyOffers() {
    try {
      const data = await getMyOffres()
      const offers = Array.isArray(data) ? data : []
      const previousStatuses = getStoredStatuses()
      const snapshot = {}

      offers.forEach((offer) => {
        snapshot[offer.id] = offer.statut || ''

        const previousStatus = previousStatuses[offer.id]
        const isTerminalStatus = offer.statut === 'ACCEPTEE' || offer.statut === 'REJETEE'
        const changed = previousStatus !== offer.statut

        if (isTerminalStatus && changed) {
          pushNotification({
            id: `${offer.id}-${offer.statut}`,
            type: offer.statut === 'ACCEPTEE' ? 'success' : 'danger',
            title: offer.statut === 'ACCEPTEE' ? 'Offre acceptée' : 'Offre rejetée',
            message:
              offer.statut === 'ACCEPTEE'
                ? `Votre offre ${formatRef('OFF', offer.id)} a été retenue.`
                : `Votre offre ${formatRef('OFF', offer.id)} n'a pas été retenue.`,
          })
        }
      })

      storeStatuses(snapshot)
      setMyOffers(offers)
    } catch {
      setMyOffers([])
    }
  }

  async function loadOffres(appelId = '') {
    setLoading(true)
    setError('')

    try {
      if (appelId) {
        const data = await getOffresByAppelOffre(appelId)
        setItems(Array.isArray(data) ? data : [])
        return
      }

      setItems([])
    } catch (err) {
      setError(parseApiError(err, 'Impossible de charger les offres.'))
    } finally {
      setLoading(false)
    }
  }

  async function startWorkflow(appel) {
    if (!appel?.id) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const affectations = await getAffectationsPrevues(appel.id)
      const lines = (Array.isArray(affectations) ? affectations : []).map((item) => ({
        besoinId: item.besoinId || '',
        typeRessource: item.typeRessource || '-',
        quantite: Number(item.quantite || 1),
        marque: '',
        prixUnitaire: '',
      }))

      if (lines.length === 0) {
        setError("Aucun matériel prévu pour cet appel d'offre. Création impossible.")
        setSelectedAppel(null)
        setDetailLines([])
        return
      }

      setSelectedAppel(appel)
      setDetailLines(lines)
      setDateLivraison('')
      setDureeGarantieMois(24)
      setSuccess(`Appel ${formatRef('AO', appel.id)} sélectionné. Saisissez la marque et le prix unitaire par matériel.`)
      await loadOffres(appel.id)
      window.scrollTo({ top: document.getElementById('offerForm').offsetTop - 50, behavior: 'smooth' })
    } catch (err) {
      setError(parseApiError(err, "Impossible de préparer l'offre pour cet appel."))
      setSelectedAppel(null)
      setDetailLines([])
    } finally {
      setLoading(false)
    }
  }

  function setLineField(index, field, value) {
    setDetailLines((prev) => prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)))
  }

  async function submitForm(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const appelOffreId = selectedAppel?.id || ''
      if (!appelOffreId || !isOptionalUuid(appelOffreId)) {
        setError("Sélectionnez d'abord un appel d'offre ouvert.")
        setLoading(false)
        return
      }

      if (!detailLines.length) {
        setError('Aucune ligne matériel à traiter pour cet appel.')
        setLoading(false)
        return
      }

      const hasInvalidLine = detailLines.some(
        (line) => !line.besoinId || !line.marque.trim() || Number(line.prixUnitaire) <= 0,
      )
      if (hasInvalidLine) {
        setError('Chaque matériel doit avoir une marque et un prix unitaire supérieur à 0.')
        setLoading(false)
        return
      }

      const payload = {
        appelOffreId,
        dateLivraison,
        dureeGarantieMois: Number(dureeGarantieMois),
        prixTotal: Number(prixTotal),
        detail: detailLines.map((line) => ({
          besoinId: line.besoinId,
          marque: line.marque.trim(),
          prixUnitaire: Number(line.prixUnitaire),
        })),
      }

      await createOffre(payload)
      setSuccess('Offre soumise avec succès.')
      const lastAppelId = selectedAppel?.id || ''
      setSelectedAppel(null)
      setDetailLines([])
      setDateLivraison('')
      setDureeGarantieMois(24)
      await loadMyOffers()
      if (lastAppelId) {
        await loadOffres(lastAppelId)
      }
    } catch (err) {
      setError(parseApiError(err, 'Soumission impossible.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleView(id) {
    setLoading(true)
    setError('')
    try {
      const data = await getOffreById(id)
      setDetailOffre(data)
    } catch (err) {
      setError(parseApiError(err, 'Lecture du détail impossible.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleSelect(id) {
    if (!window.confirm('Sélectionner cette offre ? Les autres offres seront rejetées.')) return
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await selectionnerOffre(id)
      setSuccess('Offre sélectionnée avec succès.')
      if (appelOffreIdFilter.trim() && isOptionalUuid(appelOffreIdFilter)) {
        await loadOffres(appelOffreIdFilter)
      }
    } catch (err) {
      setError(parseApiError(err, 'Sélection impossible.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -z-10 opacity-60"></div>
        <div>
          <p className="text-xs font-bold tracking-widest text-green-600 uppercase mb-1">
             {isFournisseur ? "Espace Partenaire" : "Achats & Marchés"}
          </p>
          <h1 className="page-title">
            {isFournisseur ? "Mes Offres & Soumissions" : "Gestion des Offres"}
          </h1>
          <p className="page-subtitle mb-0 max-w-xl">
            {isFournisseur
              ? "Répondez aux appels d'offres de la faculté et suivez l'état de vos soumissions."
              : "Consultez les offres reçues pour chaque appel d'offre et sélectionnez la plus avantageuse."}
          </p>
        </div>
      </div>

      {error && <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold flex items-center gap-2"><ShieldAlert size={18} /> {error}</div>}
      {success && <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm font-semibold flex items-center gap-2"><CheckCircle size={18} /> {success}</div>}

      <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
        
        {/* Left Column: Responsable Actions or Fournisseur List */}
        <div className="space-y-6">
          {canSelect && (
            <div className="pro-card p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Search className="text-green-500" size={20} />
                Filtrer par Appel d'Offre
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Sélectionnez un appel d'offre</label>
                  <select
                    className="pro-input"
                    value={appelOffreIdFilter}
                    onChange={(e) => setAppelOffreIdFilter(e.target.value)}
                  >
                    <option value="">Choisir un appel d'offre</option>
                    {appelsOffreOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {formatRef('AO', item.id)} - {item.statut || '-'}
                      </option>
                    ))}
                  </select>
                </div>
                <button 
                  className="pro-button w-full" 
                  onClick={() => loadOffres(appelOffreIdFilter)} 
                  disabled={loading || !appelOffreIdFilter}
                >
                  {loading ? 'Chargement...' : 'Afficher les offres soumises'}
                </button>
              </div>
            </div>
          )}

          {canCreate && (
             <div className="pro-card p-6 border-l-4 border-l-green-500">
               <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Handshake className="text-green-500" size={20} />
                  Appels ouverts
               </h3>
               {appelsOuverts.length === 0 ? (
                 <p className="text-sm text-slate-500">Aucun appel ouvert pour le moment.</p>
               ) : (
                 <div className="space-y-3">
                    {appelsOuverts.map((item) => (
                      <div key={item.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-green-300 transition-colors">
                         <div className="flex justify-between items-center mb-3">
                            <span className="font-mono font-bold text-slate-700">{formatRef('AO', item.id)}</span>
                            <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded">Fin: {item.dateFin || '-'}</span>
                         </div>
                         <button 
                            type="button" 
                            className="pro-button-secondary w-full flex items-center justify-center gap-2" 
                            onClick={() => startWorkflow(item)} 
                            disabled={loading}
                         >
                            Répondre <ArrowRight size={14} />
                         </button>
                      </div>
                    ))}
                 </div>
               )}
             </div>
          )}
        </div>

        {/* Right Column: Dynamic Form or List */}
        <div className="space-y-6">
          {canCreate && selectedAppel && (
            <div id="offerForm" className="pro-card p-6 bg-slate-50 border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Nouvelle proposition commerciale</h3>
              <form className="space-y-6" onSubmit={submitForm}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Appel Sélectionné</label>
                    <input className="pro-input bg-slate-100 text-slate-500" value={`${formatRef('AO', selectedAppel.id)}`} readOnly />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Prix total estimé (MAD)</label>
                     <input className="pro-input font-bold text-green-600 bg-green-50 border-green-200" type="number" value={prixTotal} readOnly />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Date de livraison prévue</label>
                    <input className="pro-input" type="date" value={dateLivraison} onChange={(e) => setDateLivraison(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Garantie globale (mois)</label>
                    <input className="pro-input" type="number" min="1" value={dureeGarantieMois} onChange={(e) => setDureeGarantieMois(e.target.value)} required />
                  </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-600 uppercase mb-4 border-b border-slate-200 pb-2">Détails par article demandé</label>
                   <div className="space-y-4">
                     {detailLines.map((line, index) => (
                       <div key={`${line.besoinId}-${index}`} className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                         <div className="flex items-center gap-2 mb-4">
                            <Package className="text-slate-400" size={16} />
                            <span className="font-bold text-slate-800">{line.typeRessource}</span>
                            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded ml-auto font-mono">Qté: {line.quantite || 1}</span>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Marque / Modèle</label>
                             <input className="pro-input text-sm py-1.5" placeholder="Ex: HP, Dell" value={line.marque} onChange={(e) => setLineField(index, 'marque', e.target.value)} required />
                           </div>
                           <div>
                             <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Prix Unitaire (MAD)</label>
                             <input className="pro-input text-sm py-1.5" placeholder="Ex: 8500" type="number" min="1" value={line.prixUnitaire} onChange={(e) => setLineField(index, 'prixUnitaire', e.target.value)} required />
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
                <button type="submit" disabled={loading} className="pro-button w-full">
                  {loading ? 'Soumission en cours...' : 'Envoyer l\'offre officielle'}
                </button>
              </form>
            </div>
          )}

          {canSelect && (
            <div className="pro-table-wrapper">
               <table>
                  <thead>
                     <tr>
                        <th>Fournisseur</th>
                        <th>Prix Total</th>
                        <th>Livraison</th>
                        <th>Statut</th>
                        <th>Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {items.map((item) => (
                     <tr key={item.id} className={item.statut === 'ACCEPTEE' ? 'bg-green-50/50' : ''}>
                        <td><span className="font-bold text-slate-700">{formatRef('FOU', item.fournisseurId)}</span></td>
                        <td><span className="font-bold text-slate-900">{item.prixTotal || '-'} MAD</span></td>
                        <td>{item.dateLivraison || '-'}</td>
                        <td>{getStatusBadge(item.statut)}</td>
                        <td>
                           <div className="flex gap-2">
                           <button className="pro-button-secondary py-1.5 px-3 text-xs" onClick={() => handleView(item.id)}>Détails</button>
                           {canSelect && item.statut !== 'ACCEPTEE' && item.statut !== 'REJETEE' && (
                              <button className="pro-button py-1.5 px-3 text-xs bg-green-600 hover:bg-green-700" onClick={() => handleSelect(item.id)}>Sélectionner</button>
                           )}
                           </div>
                        </td>
                     </tr>
                     ))}
                  </tbody>
               </table>
               {!loading && items.length === 0 && <div className="p-12 text-center text-slate-500 font-medium">Aucune offre trouvée.</div>}
            </div>
          )}

          {canCreate && !selectedAppel && (
             <div className="pro-table-wrapper">
               <h3 className="px-6 py-4 border-b border-slate-100 font-bold text-slate-800">Historique de vos offres</h3>
               <table>
                  <thead>
                     <tr>
                        <th>Réf Offre</th>
                        <th>Réf Appel</th>
                        <th>Montant</th>
                        <th>Statut</th>
                        <th>Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {myOffers.map((item) => (
                     <tr key={item.id}>
                        <td><span className="font-mono text-slate-500 font-bold">{formatRef('OFF', item.id)}</span></td>
                        <td>{formatRef('AO', item.appelOffreId)}</td>
                        <td><span className="font-bold">{item.prixTotal || '-'} MAD</span></td>
                        <td>{getStatusBadge(item.statut)}</td>
                        <td>
                           <button className="pro-button-secondary py-1.5 px-3 text-xs" onClick={() => handleView(item.id)}>Détails</button>
                        </td>
                     </tr>
                     ))}
                  </tbody>
               </table>
               {!loading && myOffers.length === 0 && <div className="p-8 text-center text-slate-500 text-sm font-medium">Vous n'avez soumis aucune offre.</div>}
             </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {detailOffre && (
         <div className="pro-card p-6 bg-slate-50 border border-slate-200 mt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
               <FileText className="text-slate-500" size={20} />
               Détail de l'offre {formatRef('OFF', detailOffre.id)}
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
               <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm bg-white p-4 rounded-lg border border-slate-200 h-fit">
                  <div className="text-slate-500 font-medium">Appel concerné</div>
                  <div className="font-mono font-bold">{formatRef('AO', detailOffre.appelOffreId)}</div>
                  <div className="text-slate-500 font-medium">Statut</div>
                  <div>{getStatusBadge(detailOffre.statut)}</div>
                  <div className="text-slate-500 font-medium">Fournisseur</div>
                  <div className="font-bold">{detailOffre.fournisseurNom || formatRef('FOU', detailOffre.fournisseurId)}</div>
                  <div className="text-slate-500 font-medium">Date livraison</div>
                  <div className="font-bold">{detailOffre.dateLivraison}</div>
                  <div className="text-slate-500 font-medium">Garantie</div>
                  <div className="font-bold">{detailOffre.dureeGarantieMois} mois</div>
                  <div className="text-slate-500 font-medium">Prix total</div>
                  <div className="font-bold text-green-600">{detailOffre.prixTotal} MAD</div>
               </div>

               <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <h4 className="text-xs uppercase font-bold text-slate-500 mb-3 border-b border-slate-100 pb-2">Articles proposés</h4>
                  {parseDetails(detailOffre.detailJson).length > 0 ? (
                     <div className="space-y-2">
                        {parseDetails(detailOffre.detailJson).map((line, index) => (
                           <div key={index} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded border border-slate-100">
                              <div>
                                 <span className="font-bold text-slate-800 mr-2">{line.marque || '-'}</span>
                                 <span className="text-slate-500 text-xs">({formatRef('BES', line.besoinId)})</span>
                              </div>
                              <span className="font-medium text-green-600">{line.prixUnitaire ?? '-'} MAD</span>
                           </div>
                        ))}
                     </div>
                  ) : <p className="text-sm text-slate-500">Aucun détail.</p>}
               </div>
            </div>
         </div>
      )}

      <NotificationToast notifications={notifications} onDismiss={dismissNotification} />
    </div>
  )
}
