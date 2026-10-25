export function getAuthToken(): string | null {
 if (typeof document === 'undefined') return null
 const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/)
 return match ? decodeURIComponent(match[1]) : null
}

export function getAuthHeaders(): Record<string, string> {
 const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
 }
 const token = getAuthToken()
 if (token) {
  headers['Authorization'] = `Bearer ${token}`
 }
 return headers
}
