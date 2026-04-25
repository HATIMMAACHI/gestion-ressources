import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layers, CheckCircle2, Cpu, Wrench, Package, ArrowRight, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="relative flex flex-col min-h-screen w-full overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)] font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[var(--violet)] opacity-[0.04] blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--violet)] opacity-[0.03] blur-[120px]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-8 lg:px-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-[10px] bg-[var(--violet)] flex items-center justify-center shadow-lg shadow-[var(--violet)]/20">
            <Layers size={22} className="text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-[var(--text-primary)]">NexaDesk</span>
        </motion.div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="hidden sm:block px-6 py-2.5 rounded-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--violet)] hover:bg-[var(--violet-light)] transition-colors">
            Connexion
          </Link>
          <Link to="/register" className="px-6 py-2.5 rounded-[10px] bg-[var(--violet)] font-bold text-white hover:bg-[#483eb0] transition-all shadow-md shadow-[var(--violet)]/30">
            Devenir Fournisseur
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 gap-16 px-6 pb-24 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--violet-light)] border border-[var(--violet)]/20 text-[var(--violet)] text-xs font-black uppercase tracking-widest mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--violet)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--violet)]"></span>
            </span>
            Plateforme SaaS de la Faculté
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-[800] leading-[1.1] tracking-tight mb-8 text-[var(--text-primary)]">
            Gérez l'essentiel.<br/>
            <span className="text-[var(--violet)]">Simplement.</span>
          </h1>
          
          <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-xl leading-relaxed font-medium">
            La plateforme intelligente qui unifie la gestion du parc informatique, la maintenance technique et la coordination des appels d'offres pour votre établissement.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link to="/login" className="group flex items-center gap-3 px-8 py-4 rounded-[12px] bg-[var(--violet)] text-white font-bold hover:bg-[#483eb0] transition-all shadow-xl shadow-[var(--violet)]/30">
              Accéder à l'espace de travail
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 border-t border-[var(--border)] pt-8">
            <div>
              <div className="text-3xl font-black text-[var(--text-primary)] mb-1">100%</div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Numérisé</div>
            </div>
            <div>
              <div className="text-3xl font-black text-[var(--text-primary)] mb-1">Sécurisé</div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Rôles Stricts</div>
            </div>
            <div>
              <div className="text-3xl font-black text-[var(--text-primary)] mb-1">Temps Réel</div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Suivi Actif</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="relative hidden lg:block"
        >
          {/* Mockup Dashboard Card */}
          <div className="bg-[var(--bg-card)] rounded-[20px] overflow-hidden border border-[var(--border)] shadow-[var(--shadow)] relative z-10">
            {/* Mac OS Window Header */}
            <div className="h-12 w-full bg-[var(--bg-page)] border-b border-[var(--border)] flex items-center px-5 gap-2">
              <div className="h-3 w-3 rounded-full bg-[var(--red)] opacity-80" />
              <div className="h-3 w-3 rounded-full bg-[var(--orange)] opacity-80" />
              <div className="h-3 w-3 rounded-full bg-[var(--green)] opacity-80" />
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-6">
                <div>
                   <div className="h-6 w-32 rounded bg-[var(--border)] mb-2" />
                   <div className="h-3 w-48 rounded bg-[var(--bg-page)]" />
                </div>
                <div className="h-12 w-12 rounded-full bg-[var(--violet-light)] flex items-center justify-center">
                  <Layers className="h-6 w-6 text-[var(--violet)]" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-4 w-full rounded bg-[var(--bg-page)]" />
                <div className="h-4 w-[90%] rounded bg-[var(--bg-page)]" />
                <div className="h-4 w-[60%] rounded bg-[var(--bg-page)]" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-6">
                <div className="h-28 rounded-[12px] bg-[var(--bg-page)] border border-[var(--border)] p-5">
                  <Package className="h-6 w-6 text-[var(--violet)] mb-3" />
                  <div className="h-3 w-16 rounded bg-[var(--border)] mb-2" />
                  <div className="h-6 w-8 rounded bg-[var(--text-muted)] opacity-20" />
                </div>
                <div className="h-28 rounded-[12px] bg-[var(--orange-bg)] border border-[var(--orange)]/20 p-5">
                  <Wrench className="h-6 w-6 text-[var(--orange)] mb-3" />
                  <div className="h-3 w-16 rounded bg-[var(--orange)]/30 mb-2" />
                  <div className="h-6 w-8 rounded bg-[var(--orange)] opacity-50" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating elements */}
          <motion.div 
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-8 -right-8 p-4 bg-white rounded-[14px] border border-[var(--border)] shadow-xl z-20"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[var(--green-bg)] flex items-center justify-center text-[var(--green)]">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)]">Offre acceptée</div>
                <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Fournisseur validé</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 lg:px-10 border-t border-[var(--border)] bg-[var(--bg-card)]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-black text-[var(--text-primary)] mb-4 tracking-tight">Une solution complète</h2>
          <p className="text-[var(--text-secondary)] font-medium">Tout ce dont votre établissement a besoin pour opérer de manière fluide, centralisé au même endroit.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="pro-card p-6 border-t-4 border-t-[var(--violet)]">
            <div className="h-12 w-12 rounded-[10px] bg-[var(--violet-light)] flex items-center justify-center mb-6">
              <Cpu className="text-[var(--violet)]" size={24} />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Matériel IT</h3>
            <p className="text-[var(--text-secondary)] text-sm font-medium leading-relaxed">Gestion complète de l'inventaire avec caractéristiques techniques détaillées.</p>
          </div>
          <div className="pro-card p-6 border-t-4 border-t-[var(--green)]">
            <div className="h-12 w-12 rounded-[10px] bg-[var(--green-bg)] flex items-center justify-center mb-6">
              <Package className="text-[var(--green)]" size={24} />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Appels d'offres</h3>
            <p className="text-[var(--text-secondary)] text-sm font-medium leading-relaxed">Workflow transparent de la publication du besoin à la sélection du fournisseur.</p>
          </div>
          <div className="pro-card p-6 border-t-4 border-t-[var(--orange)]">
            <div className="h-12 w-12 rounded-[10px] bg-[var(--orange-bg)] flex items-center justify-center mb-6">
              <Wrench className="text-[var(--orange)]" size={24} />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Maintenance</h3>
            <p className="text-[var(--text-secondary)] text-sm font-medium leading-relaxed">Signalement des pannes Kanban et rédaction des constats techniques.</p>
          </div>
          <div className="pro-card p-6 border-t-4 border-t-[var(--text-muted)]">
            <div className="h-12 w-12 rounded-[10px] bg-[var(--bg-page)] flex items-center justify-center mb-6">
              <ShieldCheck className="text-[var(--text-muted)]" size={24} />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Sécurité RBA</h3>
            <p className="text-[var(--text-secondary)] text-sm font-medium leading-relaxed">Accès sécurisé et cloisonné par rôles pour tous les acteurs du système.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
