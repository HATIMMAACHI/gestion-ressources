const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isUuid(value) {
  if (!value) return false
  return UUID_REGEX.test(value.trim())
}

export function isOptionalUuid(value) {
  if (!value || !value.trim()) return true
  return isUuid(value)
}

export function parseApiError(err, fallbackMessage) {
  const message = err?.response?.data?.message
  const details = err?.response?.data?.errors

  if (Array.isArray(details) && details.length > 0) {
    return `${message || fallbackMessage} (${details[0]})`
  }

  return message || fallbackMessage
}
