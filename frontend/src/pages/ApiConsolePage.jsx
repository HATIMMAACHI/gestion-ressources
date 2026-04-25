import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiModules, frontendHints } from '../config/apiCatalog'
import { http } from '../services/http'

function pretty(value) {
  return JSON.stringify(value, null, 2)
}

function getInitialEndpoint(module) {
  return module?.endpoints?.[0] ?? null
}

export default function ApiConsolePage() {
  const { moduleId: moduleIdFromRoute } = useParams()
  const routeModule = apiModules.find((moduleItem) => moduleItem.id === moduleIdFromRoute)
  const isModuleLocked = Boolean(routeModule)

  const [moduleId, setModuleId] = useState(routeModule?.id || apiModules[0].id)
  const activeModule = useMemo(
    () => apiModules.find((moduleItem) => moduleItem.id === moduleId) ?? apiModules[0],
    [moduleId],
  )

  const initialEndpoint = getInitialEndpoint(activeModule)

  const [endpointId, setEndpointId] = useState(initialEndpoint?.id ?? '')
  const [pathValues, setPathValues] = useState({})
  const [queryValues, setQueryValues] = useState({})
  const [bodyText, setBodyText] = useState(initialEndpoint?.bodyTemplate ? pretty(initialEndpoint.bodyTemplate) : '')
  const [loading, setLoading] = useState(false)
  const [resultText, setResultText] = useState('')
  const [errorText, setErrorText] = useState('')

  const selectedEndpoint =
    activeModule.endpoints.find((endpoint) => endpoint.id === endpointId) || initialEndpoint

  useEffect(() => {
    if (!isModuleLocked || !routeModule || moduleId === routeModule.id) {
      return
    }

    const nextEndpoint = getInitialEndpoint(routeModule)
    setModuleId(routeModule.id)
    setEndpointId(nextEndpoint?.id ?? '')
    setPathValues({})
    setQueryValues({})
    setBodyText(nextEndpoint?.bodyTemplate ? pretty(nextEndpoint.bodyTemplate) : '')
    setResultText('')
    setErrorText('')
  }, [isModuleLocked, routeModule, moduleId])

  function onChangeModule(nextModuleId) {
    const nextModule = apiModules.find((moduleItem) => moduleItem.id === nextModuleId)
    const nextEndpoint = getInitialEndpoint(nextModule)

    setModuleId(nextModuleId)
    setEndpointId(nextEndpoint?.id ?? '')
    setPathValues({})
    setQueryValues({})
    setBodyText(nextEndpoint?.bodyTemplate ? pretty(nextEndpoint.bodyTemplate) : '')
    setResultText('')
    setErrorText('')
  }

  function onChangeEndpoint(nextEndpointId) {
    const nextEndpoint = activeModule.endpoints.find((endpoint) => endpoint.id === nextEndpointId)

    setEndpointId(nextEndpointId)
    setPathValues({})
    setQueryValues({})
    setBodyText(nextEndpoint?.bodyTemplate ? pretty(nextEndpoint.bodyTemplate) : '')
    setResultText('')
    setErrorText('')
  }

  function updatePathValue(param, value) {
    setPathValues((prev) => ({ ...prev, [param]: value }))
  }

  function updateQueryValue(param, value) {
    setQueryValues((prev) => ({ ...prev, [param]: value }))
  }

  function buildUrl() {
    let finalPath = selectedEndpoint.path

    ;(selectedEndpoint.pathParams || []).forEach((param) => {
      const value = pathValues[param] || ''
      finalPath = finalPath.replace(`{${param}}`, value)
    })

    const queryEntries = Object.entries(queryValues).filter(([, value]) => value !== '')

    if (queryEntries.length === 0) {
      return finalPath
    }

    const search = new URLSearchParams(queryEntries)
    return `${finalPath}?${search.toString()}`
  }

  async function executeRequest() {
    if (!selectedEndpoint) {
      return
    }

    setLoading(true)
    setResultText('')
    setErrorText('')

    try {
      const url = buildUrl()
      const requestConfig = {
        method: selectedEndpoint.method,
        url,
      }

      if (selectedEndpoint.bodyTemplate !== undefined) {
        requestConfig.data = bodyText.trim() ? JSON.parse(bodyText) : {}
      }

      const response = await http.request(requestConfig)
      setResultText(pretty(response.data))
    } catch (error) {
      const backendError = error?.response?.data
      const fallbackError = { message: error?.message || 'Erreur inconnue.' }
      setErrorText(pretty(backendError || fallbackError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="api-console">
      <h1>{isModuleLocked ? `Interface module: ${activeModule.label}` : 'Console API complete'}</h1>
      <p className="api-console-subtitle">
        Cette interface permet de piloter les endpoints backend depuis le frontend.
      </p>

      <div className="hints-card">
        <h3>Aide rapide</h3>
        <ul>
          {frontendHints.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
      </div>

      <div className="panel-grid">
        <div className="panel-card">
          {!isModuleLocked ? (
            <>
              <label htmlFor="module-select">Module</label>
              <select id="module-select" value={moduleId} onChange={(e) => onChangeModule(e.target.value)}>
                {apiModules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.label}
                  </option>
                ))}
              </select>
            </>
          ) : null}

          <label htmlFor="endpoint-select">Endpoint</label>
          <select id="endpoint-select" value={selectedEndpoint?.id || ''} onChange={(e) => onChangeEndpoint(e.target.value)}>
            {activeModule.endpoints.map((endpoint) => (
              <option key={endpoint.id} value={endpoint.id}>
                {endpoint.method} {endpoint.path} - {endpoint.label}
              </option>
            ))}
          </select>

          <div className="endpoint-tag">
            <span className={`method-pill method-${(selectedEndpoint?.method || 'GET').toLowerCase()}`}>
              {selectedEndpoint?.method}
            </span>
            <code>{selectedEndpoint?.path}</code>
          </div>
        </div>

        <div className="panel-card">
          {(selectedEndpoint?.pathParams || []).length > 0 ? (
            <div className="form-group">
              <h3>Path Params</h3>
              {(selectedEndpoint.pathParams || []).map((param) => (
                <div key={param} className="field-row">
                  <label htmlFor={`path-${param}`}>{param}</label>
                  <input
                    id={`path-${param}`}
                    value={pathValues[param] || ''}
                    onChange={(e) => updatePathValue(param, e.target.value)}
                    placeholder={`Valeur pour ${param}`}
                  />
                </div>
              ))}
            </div>
          ) : null}

          {(selectedEndpoint?.queryParams || []).length > 0 ? (
            <div className="form-group">
              <h3>Query Params</h3>
              {(selectedEndpoint.queryParams || []).map((param) => (
                <div key={param} className="field-row">
                  <label htmlFor={`query-${param}`}>{param}</label>
                  <input
                    id={`query-${param}`}
                    value={queryValues[param] || ''}
                    onChange={(e) => updateQueryValue(param, e.target.value)}
                    placeholder={`Valeur pour ${param}`}
                  />
                </div>
              ))}
            </div>
          ) : null}

          {selectedEndpoint?.bodyTemplate !== undefined ? (
            <div className="form-group">
              <h3>Body JSON</h3>
              <textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} rows={14} />
            </div>
          ) : null}

          <button onClick={executeRequest} disabled={loading}>
            {loading ? 'Execution...' : 'Executer la requete'}
          </button>
        </div>
      </div>

      {errorText ? (
        <div className="result-card result-error">
          <h3>Erreur</h3>
          <pre>{errorText}</pre>
        </div>
      ) : null}

      {resultText ? (
        <div className="result-card">
          <h3>Reponse</h3>
          <pre>{resultText}</pre>
        </div>
      ) : null}
    </section>
  )
}
