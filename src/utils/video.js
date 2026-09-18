export function formatVideoTime(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds || 0)))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const remainder = String(total % 60).padStart(2, "0")
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${remainder}`
    : `${minutes}:${remainder}`
}

export function relativeTime(value) {
  if (!value) return "Not watched yet"
  const elapsed = Date.now() - new Date(value).getTime()
  if (!Number.isFinite(elapsed) || elapsed < 0) return "Recently watched"
  const minutes = Math.floor(elapsed / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
  const days = Math.floor(hours / 24)
  return `${days} ${days === 1 ? "day" : "days"} ago`
}
