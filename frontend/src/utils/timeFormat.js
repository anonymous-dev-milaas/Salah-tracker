export function to12hr(timeStr) {
  if (!timeStr) return '—'
  const clean = String(timeStr).slice(0, 5)
  const [h, m] = clean.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}
