import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { parseApiError } from "../utils/validation";
import { Check, Mail, Lock, Eye, EyeOff, Layers } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.successMessage || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(parseApiError(err, "Identifiants incorrects."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[var(--bg-page)] overflow-hidden font-sans">
      
      {/* Left Panel - Brand (50%) */}
      <div className="hidden lg:flex w-1/2 bg-[var(--violet)] flex-col justify-between p-12 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white opacity-5 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-black opacity-[0.15] blur-[100px]"></div>
        
        {/* Top Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-[10px] bg-white flex items-center justify-center">
             <Layers size={22} className="text-[var(--violet)]" />
          </div>
          <span className="text-white font-bold text-2xl tracking-tight">NexaDesk</span>
        </div>

        {/* Center Content */}
        <div className="z-10 max-w-lg mt-12">
          <h1 className="text-white font-bold text-[40px] leading-tight tracking-tight mb-4" style={{ letterSpacing: '-1px' }}>
            Bienvenue sur NexaDesk
          </h1>
          <p className="text-white opacity-70 text-[16px] mb-10 leading-relaxed">
            La plateforme intelligente de gestion des ressources
          </p>

          <div className="space-y-4">
            {[
              "Suivi des pannes en temps réel",
              "Gestion centralisée des ressources",
              "Tableaux de bord intelligents"
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

        {/* Bottom Glassmorphism Card */}
        <div className="z-10 mt-16 p-6 rounded-[16px] bg-white/10 backdrop-blur-md border border-white/20 max-w-md">
          <p className="text-white text-sm font-medium italic mb-4 leading-relaxed">
            "Depuis que nous utilisons NexaDesk, le temps de traitement de nos pannes a été divisé par trois. Une plateforme vraiment essentielle."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
              AM
            </div>
            <div>
              <div className="text-white font-bold text-sm">Amine M.</div>
              <div className="text-white/60 text-xs font-semibold uppercase tracking-wider">Chef de Département</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form (50%) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative">
        <div className="w-full max-w-md bg-[var(--bg-card)] p-10 rounded-[16px] shadow-[var(--shadow)] border border-[var(--border)]">
          <div className="text-center mb-8">
            <h2 className="text-[24px] font-[800] text-[var(--text-primary)] mb-2 tracking-tight">Bon retour 👋</h2>
            <p className="text-[13px] text-[var(--text-secondary)]">Connectez-vous pour accéder à votre espace de travail</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-[8px] bg-[var(--red-bg)] text-[var(--red)] text-sm font-semibold text-center">
              {error}
            </div>
          )}

          {!error && successMessage && (
            <div className="mb-6 p-3 rounded-[8px] bg-[var(--green-bg)] text-[var(--green)] text-sm font-semibold text-center">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Adresse Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-[var(--text-muted)]" />
                </div>
                <input
                  type="email"
                  className="w-full h-[48px] rounded-[10px] border border-[var(--border)] bg-white pl-11 pr-4 text-sm text-[var(--text-primary)] transition-all outline-none focus:border-[var(--violet)] focus:ring-1 focus:ring-[var(--violet)]"
                  placeholder="nom@universite.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Mot de passe</label>
                <Link to="#" className="text-[12px] font-bold text-[var(--violet)] hover:underline">Mot de passe oublié ?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-[var(--text-muted)]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full h-[48px] rounded-[10px] border border-[var(--border)] bg-white pl-11 pr-11 text-sm text-[var(--text-primary)] transition-all outline-none focus:border-[var(--violet)] focus:ring-1 focus:ring-[var(--violet)]"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-[48px] mt-2 rounded-[10px] bg-[var(--violet)] text-white font-bold text-sm transition-all hover:bg-[var(--violet-dark)] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[13px] text-[var(--text-secondary)] font-medium">
              Pas de compte ? <Link to="/register" className="text-[var(--violet)] font-bold hover:underline ml-1">Créer un compte</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
