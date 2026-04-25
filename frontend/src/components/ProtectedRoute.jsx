import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { hasAnyRole } from '../config/roles'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!hasAnyRole(user, allowedRoles)) {
    return (
      <section className="unauthorized-card">
        <h1>Acces refuse</h1>
        <p>Votre role ne permet pas d'ouvrir cette page.</p>
      </section>
    )
  }

  return children
}
