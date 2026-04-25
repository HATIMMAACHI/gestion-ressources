import { Link } from 'react-router-dom'
import { apiModules } from '../config/apiCatalog'

export default function ModulesPage() {
  return (
    <section>
      <h1>Interfaces metier</h1>
      <p className="api-console-subtitle">
        Choisis un module pour utiliser ses endpoints avec formulaires preconfigures.
      </p>

      <div className="module-grid">
        {apiModules.map((moduleItem) => (
          <article key={moduleItem.id} className="module-card">
            <h3>{moduleItem.label}</h3>
            <p>{moduleItem.endpoints.length} endpoint(s) disponible(s)</p>
            <Link className="module-link" to={`/modules/${moduleItem.id}`}>
              Ouvrir le module
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
