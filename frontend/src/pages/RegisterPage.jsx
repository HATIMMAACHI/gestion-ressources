import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerFournisseur } from "../services/authService";
import { parseApiError } from "../utils/validation";
import { Check, Mail, Lock, Eye, EyeOff, Layers, Building2 } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ nomSociete: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!form.nomSociete.trim()) {
        setError("Le nom de société est requis.");
        setLoading(false);
        return;
      }
      if (form.password.length < 6) {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
        setLoading(false);
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("La confirmation du mot de passe ne correspond pas.");
        setLoading(false);
        return;
      }

      await registerFournisseur({
        nomSociete: form.nomSociete.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      // Redirige vers login avec un paramètre dans l'état pour afficher un message de succès (à gérer dans LoginPage si on veut)
      navigate("/login", {
        replace: true,
        state: { successMessage: "Compte fournisseur créé avec succès. Connectez-vous pour continuer." },
      });
    } catch (err) {
      setError(parseApiError(err, "Inscription impossible."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[var(--bg-page)] overflow-hidden font-sans">
      
      {/* Left Panel - Brand (50%) */}
      <div className="hidden lg:flex w-1/2 bg-[var(--violet)] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white opacity-5 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-black opacity-[0.15] blur-[100px]"></div>
        
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-[10px] bg-white flex items-center justify-center">
             <Layers size={22} className="text-[var(--violet)]" />
          </div>
          <span className="text-white font-bold text-2xl tracking-tight">NexaDesk</span>
        </div>

        <div className="z-10 max-w-lg mt-12">
          <h1 className="text-white font-bold text-[40px] leading-tight tracking-tight mb-4" style={{ letterSpacing: '-1px' }}>
            Rejoignez notre réseau.
          </h1>
          <p className="text-white opacity-70 text-[16px] mb-10 leading-relaxed">
            Inscrivez votre société fournisseur pour collaborer avec notre établissement.
          </p>

          <div className="space-y-4">
            {[
              "Soumission d'offres en ligne",
              "Suivi des appels d'offre en temps réel",
              "Historique de vos participations"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <Check size={12} className="text-white" strokeWidth={3} />
                </div>
                <span className="text-white font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="z-10 mt-16 p-6 rounded-[16px] bg-white/10 backdrop-blur-md border border-white/20 max-w-md">
           <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">PORTAIL SÉCURISÉ</p>
           <p className="text-white text-sm font-medium leading-relaxed">
            Seuls les fournisseurs agréés peuvent répondre aux appels d'offre. Vos données sont chiffrées et protégées.
          </p>
        </div>
      </div>

      {/* Right Panel - Form (50%) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative overflow-y-auto">
        <div className="w-full max-w-md bg-[var(--bg-card)] p-10 rounded-[16px] shadow-[var(--shadow)] border border-[var(--border)] my-auto">
          <div className="text-center mb-8">
            <h2 className="text-[24px] font-[800] text-[var(--text-primary)] mb-2 tracking-tight">Inscription Fournisseur</h2>
            <p className="text-[13px] text-[var(--text-secondary)]">Créez votre compte pour répondre aux appels d'offre</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-[8px] bg-[var(--red-bg)] text-[var(--red)] text-sm font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Nom de la société *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building2 size={18} className="text-[var(--text-muted)]" />
                </div>
                <input
                  type="text"
                  className="w-full h-[48px] rounded-[10px] border border-[var(--border)] bg-white pl-11 pr-4 text-sm text-[var(--text-primary)] transition-all outline-none focus:border-[var(--violet)] focus:ring-1 focus:ring-[var(--violet)]"
                  placeholder="Ex: Atlas Informatique"
                  value={form.nomSociete}
                  onChange={(e) => setForm({...form, nomSociete: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Adresse Email (Login) *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-[var(--text-muted)]" />
                </div>
                <input
                  type="email"
                  className="w-full h-[48px] rounded-[10px] border border-[var(--border)] bg-white pl-11 pr-4 text-sm text-[var(--text-primary)] transition-all outline-none focus:border-[var(--violet)] focus:ring-1 focus:ring-[var(--violet)]"
                  placeholder="contact@societe.ma"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Mot de passe *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-[var(--text-muted)]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full h-[48px] rounded-[10px] border border-[var(--border)] bg-white pl-11 pr-11 text-sm text-[var(--text-primary)] transition-all outline-none focus:border-[var(--violet)] focus:ring-1 focus:ring-[var(--violet)]"
                  placeholder="Au moins 6 caractères"
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  required
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Confirmer le mot de passe *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-[var(--text-muted)]" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full h-[48px] rounded-[10px] border border-[var(--border)] bg-white pl-11 pr-11 text-sm text-[var(--text-primary)] transition-all outline-none focus:border-[var(--violet)] focus:ring-1 focus:ring-[var(--violet)]"
                  placeholder="Répétez le mot de passe"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                  required
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-[48px] mt-4 rounded-[10px] bg-[var(--violet)] text-white font-bold text-sm transition-all hover:bg-[var(--violet-dark)] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Création du compte..." : "Créer le compte fournisseur"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[13px] text-[var(--text-secondary)] font-medium">
              Déjà inscrit ? <Link to="/login" className="text-[var(--violet)] font-bold hover:underline ml-1">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
