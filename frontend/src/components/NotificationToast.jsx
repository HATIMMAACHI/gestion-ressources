import { useEffect } from 'react'

export default function NotificationToast({ notifications = [], onDismiss }) {
  useEffect(() => {
    if (!notifications.length) return undefined

    const timers = notifications.map((notification) =>
      setTimeout(() => {
        onDismiss?.(notification.id)
      }, notification.duration ?? 4500),
    )

    return () => timers.forEach((timer) => clearTimeout(timer))
  }, [notifications, onDismiss])

  if (!notifications.length) return null

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      {notifications.map((notification) => (
        <article key={notification.id} className={`toast-card toast-${notification.type || 'success'}`}>
          <div>
            <p className="toast-title">{notification.title}</p>
            <p className="toast-message">{notification.message}</p>
          </div>
          <button type="button" className="toast-close" onClick={() => onDismiss?.(notification.id)}>
            Fermer
          </button>
        </article>
      ))}
    </div>
  )
}