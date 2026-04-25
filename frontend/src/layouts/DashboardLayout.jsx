import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ROLES, ROLE_LABELS } from "../config/roles";
import { useState, useEffect } from "react";
import { getMyOffres } from "../services/offreService";
import NotificationToast from "../components/NotificationToast";
import { 
  LayoutDashboard, 
  ClipboardList, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut, 
  Wrench,
  Package,
  Calendar,
  Layers,
  Bell,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";

const MENU_ITEMS = [
  { id: "dashboard", label: "Vue d'ensemble", section: "Principal", path: "/dashboard", icon: LayoutDashboard, roles: [ROLES.CHEF_DEPT, ROLES.RESPONSABLE, ROLES.TECHNICIEN, ROLES.ENSEIGNANT, ROLES.FOURNISSEUR] },
  { id: "besoins", label: "Besoins", section: "Principal", path: "/metier/besoins", icon: ClipboardList, roles: [ROLES.ENSEIGNANT, ROLES.CHEF_DEPT, ROLES.RESPONSABLE] },
  { id: "ressources", label: "Ressources", section: "Principal", path: "/metier/ressources", icon: Package, roles: [ROLES.RESPONSABLE, ROLES.TECHNICIEN, ROLES.ENSEIGNANT, ROLES.CHEF_DEPT] },
  { id: "pannes", label: "Pannes & Maintenance", section: "Principal", path: "/metier/pannes", icon: Wrench, roles: [ROLES.ENSEIGNANT, ROLES.TECHNICIEN, ROLES.RESPONSABLE, ROLES.CHEF_DEPT, ROLES.FOURNISSEUR] },
  { id: "affectations", label: "Affectations", section: "Principal", path: "/affectations", icon: Users, roles: [ROLES.RESPONSABLE, ROLES.CHEF_DEPT] },
  { id: "reunions", label: "Planification", section: "Gestion", path: "/metier/reunions", icon: Calendar, roles: [ROLES.CHEF_DEPT, ROLES.RESPONSABLE] },
  { id: "appels-offre", label: "Appels d'offre", section: "Principal", path: "/metier/appels-offre", icon: ShoppingBag, roles: [ROLES.RESPONSABLE, ROLES.CHEF_DEPT, ROLES.FOURNISSEUR, ROLES.TECHNICIEN] },
  { id: "offres", label: "Offres Fournisseur", section: "Principal", path: "/metier/offres", icon: Layers, roles: [ROLES.RESPONSABLE, ROLES.FOURNISSEUR] },
  { id: "fournisseurs", label: "Utilisateurs", section: "Gestion", path: "/metier/fournisseurs", icon: Users, roles: [ROLES.RESPONSABLE] },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isBlacklisted, setIsBlacklisted] = useState(false);

  // Vérification immédiate de la liste noire
  useEffect(() => {
    if (user?.estListeNoire) {
      setIsBlacklisted(true);
    } else {
      setIsBlacklisted(false);
    }
  }, [user?.estListeNoire]);

  // Vérifier les offres acceptées/refusées pour les fournisseurs
  useEffect(() => {
    async function checkOfferNotifications() {
      if (user?.role !== ROLES.FOURNISSEUR) return;

      try {
        const offres = await getMyOffres();
        if (!Array.isArray(offres)) return;

        // Récupérer les offres déjà vues en session
        const seenOffers = JSON.parse(sessionStorage.getItem('seenOffers') || '[]');

        offres.forEach((offre) => {
          // Vérifier si l'offre a un statut ACCEPTEE ou REFUSEE et n'a pas été vue
          if (
            (offre.statut === 'ACCEPTEE' || offre.statut === 'REFUSEE') &&
            !seenOffers.includes(offre.id)
          ) {
            // Créer une notification
            const notificationId = `offre-${offre.id}`;
            const statusLabel = offre.statut === 'ACCEPTEE' ? 'acceptée' : 'refusée';
            
            setNotifications((prev) => [...prev, {
              id: notificationId,
              type: offre.statut === 'ACCEPTEE' ? 'success' : 'error',
              title: 'Notification Offre',
              message: `Votre offre pour l'appel d'offre #${offre.appelOffreId} a été ${statusLabel}.`,
              duration: 5000
            }]);

            // Marquer comme vue en session
            sessionStorage.setItem('seenOffers', JSON.stringify([...seenOffers, offre.id]));
          }
        });
      } catch (err) {
        console.error('Erreur lors de la vérification des offres:', err);
      }
    }

    checkOfferNotifications();
  }, [user?.role, user?.id]);

  const handleDismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredMenu = MENU_ITEMS.filter(item => item.roles.includes(user?.role));
  const roleLabel = ROLE_LABELS[user?.role] || "Utilisateur";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getPageTitle = () => {
    const activeItem = MENU_ITEMS.find(i => i.path === location.pathname);
    return activeItem ? activeItem.label : "NexaDesk";
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)]">
      <NotificationToast notifications={notifications} onDismiss={handleDismissNotification} />
      {/* Icon Sidebar (56px) */}
      <aside className="w-[56px] h-full bg-[var(--violet)] flex flex-col items-center py-4 z-20 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center mb-8 shadow-sm">
          <Layers size={18} className="text-[var(--violet)]" />
        </div>
        <div className="flex flex-col gap-4 w-full items-center flex-1">
          {filteredMenu.map((item) => {
             const isActive = location.pathname === item.path;
             return (
               <Link
                 key={`icon-${item.id}`}
                 to={item.path}
                 className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-white/20 text-white' : 'text-white opacity-45 hover:opacity-100 hover:bg-white/10'}`}
                 title={item.label}
               >
                 <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
               </Link>
             );
          })}
        </div>
        <div className="mt-auto flex flex-col gap-4 items-center w-full">
           <button className="p-2 rounded-lg text-white opacity-45 hover:opacity-100 hover:bg-white/10 transition-colors">
              <Settings size={20} />
           </button>
           <button onClick={handleLogout} className="p-2 rounded-lg text-white opacity-45 hover:opacity-100 hover:bg-white/10 transition-colors">
              <LogOut size={20} />
           </button>
        </div>
      </aside>

      {/* Text Sidebar (210px) */}
      <aside className="w-[210px] h-full bg-[var(--bg-card)] border-r border-[var(--border)] flex flex-col z-10 shrink-0">
        <div className="h-[58px] border-b border-[var(--border)] flex items-center px-6">
          <span className="font-bold text-lg tracking-tight">NexaDesk</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-6">
          {['Principal', 'Gestion'].map(section => {
             const sectionItems = filteredMenu.filter(i => i.section === section);
             if (sectionItems.length === 0) return null;
             
             return (
                <div key={section}>
                   <h4 className="px-3 mb-2 text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{section}</h4>
                   <nav className="flex flex-col gap-1">
                     {sectionItems.map((item) => {
                       const isActive = location.pathname === item.path;
                       return (
                         <Link
                           key={`text-${item.id}`}
                           to={item.path}
                           className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                             isActive 
                               ? 'bg-[var(--violet-light)] text-[var(--violet)]' 
                               : 'text-[var(--text-secondary)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)]'
                           }`}
                         >
                           {item.label}
                         </Link>
                       );
                     })}
                   </nav>
                </div>
             );
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar (58px) */}
        <header className="h-[58px] bg-[var(--bg-card)] border-b border-[var(--border)] flex items-center justify-between px-8 shrink-0">
          <h1 className="text-[20px] font-bold text-[var(--text-primary)] m-0 leading-none">
            {getPageTitle()}
          </h1>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--red)] border-2 border-white" />
            </button>
            <div className="h-6 w-px bg-[var(--border)] mx-1" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <h4 className="text-sm font-bold text-[var(--text-primary)] leading-none mb-1">{user?.nom || "Utilisateur"}</h4>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider leading-none">{roleLabel}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-[var(--violet-light)] flex items-center justify-center font-bold text-sm text-[var(--violet)]">
                {user?.nom?.charAt(0)?.toUpperCase() || "N"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Alerte permanente de liste noire */}
          {isBlacklisted && user?.role === ROLES.FOURNISSEUR && (
            <div className="mb-6 px-6 py-4 rounded-[var(--radius-md)] bg-[var(--red-bg)] border-l-4 border-l-[var(--red)] flex items-start gap-4">
              <div className="text-[var(--red)] mt-0.5">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-[var(--text-primary)] mb-1">Compte en liste noire</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Votre compte a été placé en liste noire. Vous ne pouvez plus soumettre de nouvelles offres.
                </p>
              </div>
            </div>
          )}
          
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-[1400px] mx-auto w-full"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
