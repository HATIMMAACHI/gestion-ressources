import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import { AuthProvider } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import AffectationsPage from "./pages/AffectationsPage";
import BesoinsPage from "./pages/BesoinsPage";
import RessourcesPage from "./pages/RessourcesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ReunionsPage from "./pages/ReunionsPage";
import AppelsOffrePage from "./pages/AppelsOffrePage";
import OffresPage from "./pages/OffresPage";
import PannesPage from "./pages/PannesPage";
import FournisseursPage from "./pages/FournisseursPage";
import { ROLES } from "./config/roles";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/metier/besoins"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.ENSEIGNANT,
                  ROLES.CHEF_DEPT,
                  ROLES.RESPONSABLE,
                ]}
              >
                <BesoinsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/metier/ressources"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.RESPONSABLE,
                  ROLES.CHEF_DEPT,
                  ROLES.TECHNICIEN,
                  ROLES.ENSEIGNANT,
                ]}
              >
                <RessourcesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/metier/reunions"
            element={
              <ProtectedRoute
                allowedRoles={[ROLES.CHEF_DEPT, ROLES.RESPONSABLE]}
              >
                <ReunionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/metier/appels-offre"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.RESPONSABLE,
                  ROLES.CHEF_DEPT,
                  ROLES.FOURNISSEUR,
                  ROLES.TECHNICIEN,
                ]}
              >
                <AppelsOffrePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/metier/offres"
            element={
              <ProtectedRoute
                allowedRoles={[ROLES.RESPONSABLE, ROLES.FOURNISSEUR]}
              >
                <OffresPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/metier/pannes"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.ENSEIGNANT,
                  ROLES.CHEF_DEPT,
                  ROLES.RESPONSABLE,
                  ROLES.TECHNICIEN,
                  ROLES.FOURNISSEUR,
                ]}
              >
                <PannesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/metier/fournisseurs"
            element={
              <ProtectedRoute allowedRoles={[ROLES.RESPONSABLE]}>
                <FournisseursPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/affectations"
            element={
              <ProtectedRoute
                allowedRoles={[ROLES.RESPONSABLE, ROLES.CHEF_DEPT]}
              >
                <AffectationsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
